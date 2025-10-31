import express from 'express';
import { importBooks, addBook, borrowBook, returnBook, getBooks, getBookById, getCategories, getMyRentals, getOwnerBooks, updateBook, deleteBook, requestBookApproval, uploadBookFile, serveBookFile } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

// Public routes (no authentication required for browsing)
router.get('/', getBooks);
router.get('/categories', getCategories);

// Protected routes (authentication required)
router.post('/', protect, addBook);
// Upload an owner file (base64 payload)
router.post('/upload', protect, uploadBookFile);
router.post('/import', protect, importBooks);
router.post('/borrow/:bookId', protect, borrowBook);
router.post('/return/:bookId', protect, returnBook);
// Serve uploaded file (authorization checked in controller)
router.get('/:id/file', protect, serveBookFile);
// Read-only book viewer for renters who have active rental (read-only)
router.get('/:id/read', protect, async (req, res, next) => {
	// delegate to controller if available
	try {
		const controller = await import('../controllers/bookController.js');
		return controller.readBook(req, res, next);
	} catch (err) {
		next(err);
	}
});
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