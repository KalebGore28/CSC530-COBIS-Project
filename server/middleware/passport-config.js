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
    (_accessToken, _refreshToken, _profile, done) => {
      // Only need the profile information
      done(null, _profile);
    }
  )
);

export default passport;