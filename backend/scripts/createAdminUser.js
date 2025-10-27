import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load .env from backend root
dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

const MONGODB_URI = process.env.MONGODB_URI 
const argv = process.argv.slice(2);
const email = argv[0] || 'admin@example.com';
const name = argv[1] || 'Admin User';
const firebaseUID = argv[2] || `local-admin-${Date.now()}`;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email });
    if (user) {
      // Ensure role is admin
      user.role = 'admin';
      user.firebaseUID = user.firebaseUID || firebaseUID;
      await user.save();
      console.log(`Updated existing user ${email} -> role=admin`);
    } else {
      user = await User.create({
        firebaseUID,
        name,
        email,
        role: 'admin',
      });
      console.log(`Created admin user: ${email}`);
    }

    console.log('User id:', user._id.toString());
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message || err);
    process.exit(1);
  }
};

createAdmin();
