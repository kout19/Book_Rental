import admin from 'firebase-admin';
import dotenv from 'dotenv';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// Initialize firebase-admin if environment variables are present
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// POST /api/auth/sync
// Verifies the provided Firebase ID token (from Authorization header) and
// ensures a corresponding Mongo User exists (creates it if missing). Returns the user.
export const syncUser = async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(500).json({ message: 'Firebase admin not configured on server.' });
    }

    // Expect Authorization: Bearer <firebaseIdToken>
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Missing Firebase ID token in Authorization header.' });

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    if (!uid) return res.status(400).json({ message: 'Invalid Firebase token.' });

    const { name, email, role } = req.body || {};

    let user = await User.findOne({ firebaseUID: uid });
    if (user) {
      // Update fields if provided
      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (role) updates.role = role;
      if (Object.keys(updates).length > 0) {
        user = await User.findByIdAndUpdate(user._id, updates, { new: true });
      }
      // create server JWT for this user
      const serverToken = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).json({ message: 'User updated', user, token: serverToken });
    }

    // Create new user
    const newUser = await User.create({
      firebaseUID: uid,
      name: name || decoded.name || decoded.email || 'User',
      email: email || decoded.email || `${uid}@firebase.local`,
      role: role || 'user',
    });
    const serverToken = jwt.sign({ id: newUser._id.toString(), email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User created', user: newUser, token: serverToken });
  } catch (err) {
    console.error('Error in syncUser:', err.message || err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export default { syncUser };
