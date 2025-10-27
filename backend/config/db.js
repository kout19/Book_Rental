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
    console.log("connected to book_rental mongoDB")
  } catch (err) {
    console.log("Database error", err.message);
    }
};
export default connectDB;

