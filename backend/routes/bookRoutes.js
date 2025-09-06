import express from 'express';
import { addBook, borrowBook, returnBook} from '../controllers/bookController.js';
import {protect} from '../middleware/authMiddleware.js';
const router= express.Router();
router.post('/add', protect, addBook);
router.post('/borrow/:bookId', protect, borrowBook);
router.post('/return/:bookId', protect, returnBook);

export default router;