// import express, { Request, Response } from 'express';
// import passport from '../utils/passport-config';
// import { authenticateJWT } from '../middleware/authenticateJWT';
// import { attachUserPermissions } from '../middleware/attachUserPermissions';
// import { generateToken } from '../utils/jwt';
// import { getDbConnection } from '../db/connection.js';
// import { eq } from 'drizzle-orm';
// import { users } from '../db/models/users';
// import { roles } from '../db/schema';

// import 'zod-openapi/extend';
// import { z } from 'zod';
// import { createDocument } from 'zod-openapi';

// const router = express.Router()

// router.get('/google',
//   passport.authenticate('google', { scope: ['profile', 'email'], session: false })
// )

// router.get('/google/callback',
//   passport.authenticate('google', { session: false, failureRedirect: '/login' }),
//   async (req: any, res: any) => {
//     const dbConnectionInstance = await getDbConnection();
//     const db = dbConnectionInstance.orm;

//     // Cast req.user to any or a proper interface if available
//     const userProfile = req.user as any;
//     const user_id = userProfile.id; // Google SSO unique identifier
//     const email = userProfile?.emails[0].value;
//     const display_name = userProfile?.displayName;

//     // Ensure email is from Murray State
//     if (!email.endsWith('@murraystate.edu')) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }

//     try {
//       // Look for an existing user using Drizzle ORM
//       const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
//       let user = existingUsers[0];

//       if (!user) {
//         // If new, create an entry with is_active = false (pending approval)
//         await db.insert(users).values({
//           id: user_id,
//           email: email,
//           display_name: display_name,
//           is_active: false,
//           last_login: new Date().toISOString(),
//           created_at: new Date().toISOString(),
//         });
//         return res.status(403).json({
//           message: 'Your account is pending admin approval. Please contact an administrator.',
//         });
//       }

//       // If user is inactive (pending approval), deny access
//       if (!user.is_active) {
//         return res.status(403).json({
//           message: 'Your account is still pending approval. Please wait for admin confirmation.',
//         });
//       }

//       // If user is active, update last login time
//       await db
//         .update(users)
//         .set({ last_login: new Date().toISOString() })
//         .where(eq(users.email, email));

//       // Generate JWT and set cookie
//       const token = generateToken(req.user);
//       res.cookie('jwt', token, {
//         httpOnly: true,
//         secure: false, //process.env.NODE_ENV === 'production', //TODO: Set to true in production
//         sameSite: 'lax',
//         maxAge: 3600 * 1000, // 1 hour
//       });

//       // Determine the redirect URL based on the environment:
//       const redirectURL = process.env.NODE_ENV === 'development'
//         ? 'http://localhost:5173/dashboard'  // your React dev server URL
//         : '/dashboard';
//       res.redirect(redirectURL);
//     } catch (error: any) {
//       console.error('Database query failed:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// )


// router.get('/me',
//   authenticateJWT,
//   attachUserPermissions,
//   (req: Request, res: Response) => {
//     res.json({
//       info: req.user,
//       roles: req.roles,
//     });
//   }
// )


// router.get('/logout', (req: Request, res: Response) => {
//   res.clearCookie('jwt');
//   // Determine the redirect URL based on the environment:
//   const redirectURL = process.env.NODE_ENV === 'development'
//     ? 'http://localhost:5173'  // your React dev server URL
//     : '/';
//   res.redirect(redirectURL);
// })

// // API route for admins to approve users
// // This route is just an example and should be protected with proper authorization
// // .post('/approve/:email', authenticateJWT, async (req: any, res: any) => {
// //   const { email } = req.params;
// //   const currentUser = req.user as any;

// //   // Ensure only admins can approve users
// //   if (currentUser.role !== 'admin') {
// //     return res.status(403).json({ message: 'Forbidden: Admins only' });
// //   }

// //   try {
// //     await db
// //       .update(users)
// //       .set({ is_active: true })
// //       .where(eq(users.email, email));

// //     res.json({ message: 'User approved successfully' });
// //   } catch (error: any) {
// //     console.error('Approval failed:', error);
// //     res.status(500).json({ message: 'Internal server error' });
// //   }
// // })

// export default router;