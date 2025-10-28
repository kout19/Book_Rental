import express from 'express';
import {
    getUsers, 
    updateUserRole, 
    updateUserStatus,
    deleteUser,
    approveOwner,
    approveBook,
    listUnapprovedBooks,
} from '../controllers/adminController.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.use(protect, adminOnly);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.patch("/users/:id/status",updateUserStatus);
router.delete('/users/:id', deleteUser);
// Approve owner account
router.put('/users/:id/approve', approveOwner);
// Admin book approval endpoint
router.put('/books/:id/approve', approveBook);
router.get('/unapproved-books', listUnapprovedBooks);
export default router;
