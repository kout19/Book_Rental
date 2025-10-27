import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Must come before using process.env

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is undefined. Check your .env file location and variable name.");
  process.exit(1);
}

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB successfully"))
.catch(err => console.error("❌ Error connecting to MongoDB:", err));
