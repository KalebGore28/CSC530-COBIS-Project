// /utils/jwt.js
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export function generateToken(user: any) {
  // Create a payload. You can store whatever you need.
  // Here we use a unique identifier from the user object and some basic info.
  const payload = {
    user_id: user.id || user._json?.sub, // unique identifier from Google
    full_name: user.displayName,
    first_name: user.name && user.name.givenName,
    last_name: user.name && user.name.familyName,
    email: user.emails && user.emails[0].value,
    profile_pic: user.photos && user.photos[0].value,
  };

  // Sign the token with an expiration (e.g., 1 hour)
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
  return token;
}