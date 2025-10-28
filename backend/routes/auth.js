import express from 'express';
import { syncUser } from '../controllers/authController.js';

const router = express.Router();

// Sync or create a MongoDB user for a Firebase-authenticated user.
// Expects Authorization: Bearer <firebaseIdToken>
router.post('/sync', syncUser);

export default router;
