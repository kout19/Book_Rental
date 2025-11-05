import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI 
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB atlas connected to book_rental database");
  } catch (err) {
    console.log("Database error", err.message);
    }
};
export default connectDB;

