import express from 'express';
import {
    getUsers, 
    updateUserRole, 
    updateUserStatus,
    deleteUser,
    approveOwner,
    approveBook,
    listUnapprovedBooks,
    getApprovalRequests,
    approveUsersBulk,
    approveBooksBulk,
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
// Approval requests overview
router.get('/approval-requests', getApprovalRequests);
// Bulk approve endpoints
router.put('/users/approve-bulk', approveUsersBulk);
router.put('/books/approve-bulk', approveBooksBulk);
export default router;
