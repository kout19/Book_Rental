import express from 'express';
import { syncUser, whoami,loginController } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Sync or create a MongoDB user for a Firebase-authenticated user.
// Expects Authorization: Bearer <firebaseIdToken>
router.post('/sync', syncUser);
router.post('/login', loginController); 
// Protected debug endpoint - returns basic info about the authenticated user
router.get('/whoami', protect, whoami);

export default router;
