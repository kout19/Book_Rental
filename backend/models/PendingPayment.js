import mongoose from 'mongoose';

const pendingPaymentSchema = new mongoose.Schema({
  tx_ref: { type: String, required: true, unique: true },
  reference: { type: String, default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  periodDays: { type: Number, default: 1 },
  startDate: { type: Date, default: Date.now },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: process.env.STRIPE_CURRENCY || process.env.CHAPA_CURRENCY || 'USD' },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  chapaResponse: { type: Object, default: null },
  stripeResponse: { type: Object, default: null },
}, { timestamps: true });

const PendingPayment = mongoose.model('PendingPayment', pendingPaymentSchema);
export default PendingPayment;
