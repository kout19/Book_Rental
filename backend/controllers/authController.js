import admin from 'firebase-admin';
import dotenv from 'dotenv';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// Initialize firebase-admin preferring a local service account JSON file to avoid PEM issues
if (!admin.apps.length) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const svcPath = path.join(__dirname, '../config/serviceAccountKey.json');
    if (fs.existsSync(svcPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(svcPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
  } catch (e) {
    console.error('Failed to initialize firebase-admin in authController:', e?.message || e);
  }
}

// POST /api/auth/sync
// Verifies the provided Firebase ID token (from Authorization header) and
// ensures a corresponding Mongo User exists (creates it if missing). Returns the user.
export const syncUser = async (req, res) => {
  try {
    // We prefer server-side Firebase verification, but allow a dev fallback when
    // SKIP_FIREBASE_VERIFY=true is set in .env so you can omit Firebase admin creds locally.
    let uid;
    let decoded;
    if (admin.apps.length) {
      // Expect Authorization: Bearer <firebaseIdToken>
      const authHeader = req.headers.authorization || '';
      const token = authHeader.split(' ')[1];
      if (!token) return res.status(400).json({ message: 'Missing Firebase ID token in Authorization header.' });

      decoded = await admin.auth().verifyIdToken(token);
      uid = decoded.uid;
      if (!uid) return res.status(400).json({ message: 'Invalid Firebase token.' });
    } else if (process.env.SKIP_FIREBASE_VERIFY === 'true') {
      // DEV fallback: allow sync without verifying Firebase token. The client should
      // POST { uid?, name?, email?, role? } in the request body. If uid not provided
      // we generate a dev uid. This is intentionally permissive and should only be
      // used during local development.
      uid = req.body?.uid || `dev-${Date.now()}`;
      console.warn('Firebase admin not configured. Using SKIP_FIREBASE_VERIFY dev fallback to create/sync user for uid=', uid);
      decoded = { uid };
    } else {
      return res.status(500).json({ message: 'Firebase admin not configured on server.' });
    }

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

// Protected debug endpoint: returns the current authenticated user's basic info
export const whoami = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    // req.user may be a Mongoose doc; normalize id
  const id = req.user._id ? req.user._id.toString() : req.user.id || null;
  res.status(200).json({ id, name: req.user.name, email: req.user.email, role: req.user.role, wallet: req.user.wallet || 0, isApproved: req.user.isApproved || false, approvalRequested: req.user.approvalRequested || false });
  } catch (err) {
    console.error('Error in whoami:', err && (err.stack || err.message || err));
    res.status(500).json({ message: 'Server error' });
  }
};
export const loginController =async(req, res)=>{
 try{
    const {idToken}=req.body;
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user= await User.findOne({firebaseUID:decoded.uid});
    if(!user)
      return res.status(404).json({message:"User not found"});
    if(user.status==="disabled"){
      return res.status(403).json({message:"Account disabled. Contact admin."});
    }
      return res.status(200).json({success: true, role: user.role, message:"Login successful", user});
 }catch(error){
  console.log(error)
  res.status(500).json({message:"Login Failed ", error: error.message })
 }
}


// include whoami in default export as well for compatibility
export default { syncUser, whoami};
