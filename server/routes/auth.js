// /routes/auth.js
import express from 'express';
import passport from '../middleware/passport-config.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

// Initiate Google OAuth authentication
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Callback route after Google authentication
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate a JWT token upon successful authentication
    const token = generateToken(req.user);

    // Set the token in an HTTP-only cookie.
    // - `httpOnly: true` prevents client-side JavaScript from accessing the cookie.
    // - `secure: process.env.NODE_ENV === 'production'` ensures cookies are sent over HTTPS in production.
    // - `sameSite: 'strict'` helps mitigate CSRF attacks.
    // - `maxAge` is in milliseconds (here, 1 hour).
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 1000, // 1 hour
    });

    // Redirect to your front-end or send a JSON response
    res.redirect('/dashboard'); // or res.json({ message: "Authentication successful" });
  }
);

// Optional logout route: Clear the JWT cookie
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
});

export default router;