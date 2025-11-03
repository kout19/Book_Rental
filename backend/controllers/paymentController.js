import Book from '../models/BookSchema.js';
import User from '../models/User.js';
import Rental from '../models/Rental.js';
import PendingPayment from '../models/PendingPayment.js';

import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || null;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2022-11-15' }) : null;

// --- Stripe integration -------------------------------------------------
// Create a Stripe Checkout session and return the checkout URL
export const createStripeSession = async (req, res) => {
  try {
    const { bookId, periodDays, startDate } = req.body;
    const book = await Book.findById(bookId).populate('owner');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const days = parseInt(periodDays) || 1;
    const amount = Math.round(((book.rentPrice || 0) * days) * 100); // cents

    const user = await User.findById(req.user?.id || null);

    if (!stripe) {
      // dev fallback: create pending and return a mock success URL containing a fake session id
      const sessionId = `mock-stripe-${Date.now()}`;
      try {
        await PendingPayment.create({ tx_ref: sessionId, user: req.user?.id, book: bookId, periodDays: days, startDate: startDate || new Date(), amount: amount / 100, currency: process.env.STRIPE_CURRENCY || 'USD', status: 'pending' });
      } catch (e) { console.warn('Failed to create mock pending', e); }
      const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/checkout-success?bookId=${bookId}&periodDays=${days}&startDate=${encodeURIComponent(startDate || '')}&session_id=${encodeURIComponent(sessionId)}`;
      return res.status(200).json({ mock: true, successUrl, sessionId });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: process.env.STRIPE_CURRENCY || 'usd',
            product_data: { name: `${book.title} (rental ${days} days)` },
            unit_amount: amount,
          },
          quantity: 1,
        }
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/checkout-success?session_id={CHECKOUT_SESSION_ID}&bookId=${bookId}&periodDays=${days}&startDate=${encodeURIComponent(startDate || '')}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/book/${bookId}`,
      metadata: { bookId: String(bookId), periodDays: String(days), startDate: startDate || '' }
    });

    // persist pending payment
    try {
      await PendingPayment.create({ tx_ref: session.id, reference: session.payment_intent || null, user: req.user?.id, book: bookId, periodDays: days, startDate: startDate || new Date(), amount: amount / 100, currency: process.env.STRIPE_CURRENCY || 'USD', status: 'pending', stripeResponse: session });
    } catch (e) { console.warn('Failed to persist pending payment', e); }

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('createStripeSession error', err);
    res.status(500).json({ message: 'Failed to create Stripe session', error: err.message });
  }
};

// Confirm Stripe session and create rental
export const confirmStripeAndCreateRental = async (req, res) => {
  try {
    const { session_id, bookId, periodDays, startDate } = req.body;
    const sess = session_id;
    if (!sess) return res.status(400).json({ message: 'Missing session_id' });

    if (!stripe) {
      // dev fallback: find pending by tx_ref
      const pending = await PendingPayment.findOne({ tx_ref: session_id });
      if (!pending) return res.status(400).json({ message: 'Mock session not found' });
      // mark paid
      pending.status = 'paid';
      await pending.save();
      // create rental similar to webhook
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Not authenticated' });
      const book = await Book.findById(bookId);
      if (!book) return res.status(404).json({ message: 'Book not found' });
      const availableCopies = (book.totalCopies || 1) - (book.rentedCount || 0);
      if (availableCopies <= 0) return res.status(400).json({ message: 'No available copies' });
      const rental = await Rental.create({ renter: userId, book: book._id, owner: book.owner, startDate: startDate ? new Date(startDate) : new Date(), returned: false });
      book.rentedBy = book.rentedBy || []; if (userId) book.rentedBy.push(userId);
      book.rentedCount = (book.rentedCount || 0) + 1; if ((book.rentedCount || 0) >= (book.totalCopies || 1)) { book.status = 'rented'; book.available = false; }
      await book.save(); if (userId) await User.findByIdAndUpdate(userId, { $push: { rentedBooks: book._id } });
      rental.days = pending.periodDays || periodDays || 1; rental.totalPrice = pending.amount || 0; await rental.save();
      return res.status(200).json({ message: 'Mock payment confirmed and rental created', rental });
    }

    // fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sess, { expand: ['payment_intent'] });
    if (!session) return res.status(400).json({ message: 'Stripe session not found' });
    if (session.payment_status !== 'paid') return res.status(400).json({ message: 'Payment not completed', session });

    // update pending
    try {
      const pending = await PendingPayment.findOne({ tx_ref: session.id });
      if (pending) { pending.status = 'paid'; pending.reference = session.payment_intent || pending.reference; pending.stripeResponse = session; await pending.save(); }
    } catch (e) { console.warn('Failed to update pending', e); }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const book = await Book.findById(bookId || session.metadata?.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const availableCopies = (book.totalCopies || 1) - (book.rentedCount || 0);
    if (availableCopies <= 0) return res.status(400).json({ message: 'No available copies' });

    const start = startDate ? new Date(startDate) : (session.metadata?.startDate ? new Date(session.metadata.startDate) : new Date());
    const days = parseInt(periodDays || session.metadata?.periodDays || '1') || 1;

    const rental = await Rental.create({ renter: userId, book: book._id, owner: book.owner, startDate: start, returned: false });
    book.rentedBy = book.rentedBy || []; book.rentedBy.push(userId);
    book.rentedCount = (book.rentedCount || 0) + 1; if ((book.rentedCount || 0) >= (book.totalCopies || 1)) { book.status = 'rented'; book.available = false; }
    await book.save(); await User.findByIdAndUpdate(userId, { $push: { rentedBooks: book._id } });

    rental.days = days; rental.totalPrice = (session.amount_total || 0) / 100; await rental.save();

    // credit owner
    try { const owner = await User.findById(book.owner); if (owner) { owner.wallet = (owner.wallet || 0) + (rental.totalPrice || 0); await owner.save(); } } catch (wErr) { console.error('Failed to credit owner wallet after stripe payment:', wErr); }

    res.status(200).json({ message: 'Stripe payment confirmed and rental created', rental, session });
  } catch (err) {
    console.error('confirmStripeAndCreateRental error', err);
    res.status(500).json({ message: 'Failed to confirm Stripe payment', error: err.message });
  }
};

// Stripe webhook handler
export const stripeWebhookHandler = async (req, res) => {
  try {
    const rawBody = req.rawBody || req.body;
    const sig = req.headers['stripe-signature'];
    let event;

    if (stripe && process.env.STRIPE_WEBHOOK_SECRET && sig) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (e) {
        console.error('Stripe webhook signature verification failed', e.message || e);
        return res.status(400).send(`Webhook Error: ${e.message}`);
      }
    } else {
      // no verification available; assume body is parsed JSON
      event = req.body;
    }

    if (!event) return res.status(400).send('No event');
    const type = event.type || event?.type || 'unknown';

    if (type === 'checkout.session.completed' || (event.type === 'checkout.session.completed')) {
      const session = event.data ? event.data.object : event;
      const sessionId = session.id || session.session_id || session.sessionId;
      // find pending
      const pending = await PendingPayment.findOne({ tx_ref: sessionId });
      if (pending && pending.status === 'paid') return res.status(200).send('already processed');
      // finalize rental
      try {
        const bookId = session.metadata?.bookId || pending?.book;
        const userId = pending?.user || null;
        const book = await Book.findById(bookId);
        if (!book) return res.status(200).send('book missing');
        const availableCopies = (book.totalCopies || 1) - (book.rentedCount || 0);
        if (availableCopies <= 0) return res.status(200).send('no copies');
        const start = session.metadata?.startDate ? new Date(session.metadata.startDate) : (pending?.startDate || new Date());
        const rental = await Rental.create({ renter: userId, book: book._id, owner: book.owner, startDate: start, returned: false });
        book.rentedBy = book.rentedBy || []; if (userId) book.rentedBy.push(userId);
        book.rentedCount = (book.rentedCount || 0) + 1; if ((book.rentedCount || 0) >= (book.totalCopies || 1)) { book.status = 'rented'; book.available = false; }
        await book.save(); if (userId) await User.findByIdAndUpdate(userId, { $push: { rentedBooks: book._id } });
        if (pending) { pending.status = 'paid'; pending.reference = session.payment_intent || pending.reference; pending.stripeResponse = session; await pending.save(); }
        rental.days = pending?.periodDays || parseInt(session.metadata?.periodDays || '1') || 1; rental.totalPrice = (session.amount_total || 0) / 100; await rental.save();
        try { const owner = await User.findById(book.owner); if (owner) { owner.wallet = (owner.wallet || 0) + (rental.totalPrice || 0); await owner.save(); } } catch (wErr) { console.error('Failed to credit owner wallet after stripe webhook:', wErr); }
        return res.status(200).send('processed');
      } catch (procErr) {
        console.error('Failed to finalize rental from stripe webhook', procErr);
        return res.status(500).send('error');
      }
    }

    return res.status(200).send('ok'); 
  } catch (err) {
    console.error('stripeWebhookHandler error', err);
    res.status(500).send('error');
  }
};
 
export default { createStripeSession, confirmStripeAndCreateRental };
 