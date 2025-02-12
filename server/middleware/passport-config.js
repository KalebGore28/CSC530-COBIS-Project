// /middleware/passport-config.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../utils/config.js';

// Configure Google OAuth Strategy without session support
passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: '/auth/google/callback', // Must match your Google Developer Console settings
    },
    (accessToken, refreshToken, profile, done) => {
      // In a real-world scenario, you’d look up or create a user in your database here.
      // For now, simply return the profile.
      return done(null, profile);
    }
  )
);

export default passport;