// /middleware/passport-config.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../utils/config.ts';

// Configure Google OAuth Strategy without session support
passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: '/api/auth/google/callback', // Must match your Google Developer Console settings
    },
    (_accessToken, _refreshToken, profile, done) => {
      // Pass the profile data to the next
      done(null, profile);
    }
  )
);

export default passport;