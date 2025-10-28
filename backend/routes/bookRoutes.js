import express from 'express';
import { importBooks, addBook, borrowBook, returnBook, getBooks, getBookById, getCategories, getMyRentals, getOwnerBooks, updateBook, deleteBook, requestBookApproval } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

// Public routes (no authentication required for browsing)
router.get('/', getBooks);
router.get('/categories', getCategories);

// Protected routes (authentication required)
router.post('/', protect, addBook);
router.post('/import', protect, importBooks);
router.post('/borrow/:bookId', protect, borrowBook);
router.post('/return/:bookId', protect, returnBook);
router.get('/my-rentals', protect, getMyRentals);
// Owner-specific list
router.get('/owner/me', protect, getOwnerBooks);
// Request admin approval for a specific book
router.post('/:id/request-approval', protect, requestBookApproval);
// Update/delete book
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

// NOTE: Keep the ':id' route LAST so it doesn't accidentally match other literal paths
// like '/my-rentals' — Express matches routes in order and '/:id' will greedily
// match any single path segment.
router.get('/:id', getBookById);

export default router;