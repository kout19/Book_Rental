import express from 'express';
import { updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Update user profile (name/email)
router.put('/:id', protect, updateUserProfile);

export default router;
