import express from 'express';
import { authenticateJWT } from '../middleware/authenticateJWT.js';

const router = express.Router();

router.get('/dashboard', authenticateJWT, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}!`, user: req.user });
});

export default router;