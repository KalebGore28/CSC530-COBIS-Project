// /middleware/authenticateJWT.js
import jwt from 'jsonwebtoken';
import config from '../utils/config.ts';

export function authenticateJWT(req, res, next) {
  // Retrieve the token from the HTTP-only cookie
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      // Attach the decoded payload to the request
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ message: "Authentication token not found" });
  }
}