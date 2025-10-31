import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  days: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  returned: { type: Boolean, default: false },
}, { timestamps: true });

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;
