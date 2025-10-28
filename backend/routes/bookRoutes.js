import express from 'express';
import { importBooks, addBook, borrowBook, returnBook, getBooks, getBookById, getCategories, getMyRentals } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

// Public routes (no authentication required for browsing)
router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/:id', getBookById);

// Protected routes (authentication required)
router.post('/import', protect, importBooks);
router.post('/borrow/:bookId', protect, borrowBook);
router.post('/return/:bookId', protect, returnBook);
router.get('/my-rentals', protect, getMyRentals);

export default router;