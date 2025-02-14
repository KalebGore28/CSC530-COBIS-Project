import express from 'express';
import passport from '../middleware/passport-config.js';
import { authenticateJWT } from '../middleware/authenticateJWT.js';
import { generateToken } from '../utils/jwt.js';
import sql from 'mssql';
import { poolPromise } from '../db.js';

const router = express.Router();

// Initiate Google OAuth authentication
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Callback route after Google authentication
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    const user_id = req.user.id; // Google SSO unique identifier
    const email = req.user?.emails[0].value;
    const display_name = req.user?.displayName;

    // Ensure email is from Murray State
    if (!email.endsWith('@murraystate.edu')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM users WHERE email = @email');

      let user = result.recordset[0];

      if (!user) {
        // If new, create an entry with `is_active = 0` (pending approval)
        await pool
          .request()
          .input('user_id', sql.NVarChar, user_id)
          .input('email', sql.NVarChar, email)
          .input('display_name', sql.NVarChar, display_name)
          .query(
            `INSERT INTO users (user_id, email, display_name, is_active, last_login, created_at, updated_at)
             VALUES (@user_id, @email, @display_name, 0, NULL, GETDATE(), GETDATE())`
          );

        return res.status(403).json({
          message: 'Your account is pending admin approval. Please contact an administrator.',
        });
      }

      // If user is inactive (pending approval), deny access
      if (user.is_active === false) {
        return res.status(403).json({
          message: 'Your account is still pending approval. Please wait for admin confirmation.',
        });
      }

      // If user is active, update last login time and allow access
      await pool
        .request()
        .input('email', sql.NVarChar, email)
        .query('UPDATE users SET last_login = GETDATE() WHERE email = @email');

      // Generate JWT and set cookie
      const token = generateToken(user);
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 * 1000, // 1 hour
      });

      res.redirect('/');
    } catch (error) {
      console.error('Database query failed:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Get decoded JWT payload
router.get('/me',
  authenticateJWT,
  (req, res) => {
  res.json(req.user);
});

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

// API route for admins to approve users
router.post('/approve/:email', authenticateJWT, async (req, res) => {
  const { email } = req.params;

  // Ensure only admins can approve users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('UPDATE users SET is_active = 1, updated_at = GETDATE() WHERE email = @email');

    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Approval failed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;