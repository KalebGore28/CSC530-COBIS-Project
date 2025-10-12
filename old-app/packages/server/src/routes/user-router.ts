import express from 'express';
import { UserController } from '../controllers/user-controller';
import { hasRole } from '../middleware/has-role';
import { requireEnabled } from '../middleware/require-enabled';

/**
 * User routes
 * @module routes/user
 * @requires express
 * @requires ../controllers/user-controller
 * @description This module defines the routes for user operations.
 */
const router: express.Router = express.Router();

// Get current user info (Info allowed even for disabled users)
router.get('/me', UserController.getUserInfo);

router.use(requireEnabled); // NOT A DUPLICATE: this is to ensure the user is enabled before accessing any further user routes
router.use(hasRole('cobis_administrator')); // Only allow admin to access these routes
router.get('/', UserController.getAllUsers);
router.get('/:userId', UserController.getUser);
router.post('/:userId/enable', UserController.enableUser);
router.post('/:userId/disable', UserController.disableUser);
router.put('/:userId/provision', UserController.provisionUser);

// Enable/disable user routes
router.post('/enable/:userId', UserController.enableUser);
router.post('/disable/:userId', UserController.disableUser);

export default router; 