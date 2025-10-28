import express from 'express';
import { updateUserProfile, requestApproval } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Update user profile (name/email)
router.put('/:id', protect, updateUserProfile);
// Request admin approval for owner account
router.post('/request-approval', protect, requestApproval);

export default router;
