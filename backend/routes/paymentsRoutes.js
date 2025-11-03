import express from 'express';
import { createStripeSession, confirmStripeAndCreateRental, stripeWebhookHandler } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create Stripe session (protected)
router.post('/create-stripe', protect, createStripeSession);

// Stripe webhook endpoint (public) — Stripe will POST notifications here
// Stripe requires raw body to validate signatures; the server where this route is mounted
// should ensure raw body is available (express.raw) or use a dedicated middleware.
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);

// Confirm Stripe session and create rental (protected)
router.post('/confirm-stripe', protect, confirmStripeAndCreateRental);

export default router;
