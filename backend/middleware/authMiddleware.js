import admin from 'firebase-admin';
import jwt from "jsonwebtoken";
import User from "../models/User.js"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Try to initialize firebase-admin from a local service account JSON file if present
if (!admin.apps.length) {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const svcPath = path.join(__dirname, '../config/serviceAccountKey.json');
    if (fs.existsSync(svcPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(svcPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Fallback to environment variables (private key should contain escaped \n sequences)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
  } catch (e) {
    console.error('Failed to initialize firebase-admin:', e?.message || e);
  }
}
export const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.warn('protect middleware: no authorization token provided');
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    try {
      // First try server-signed JWT
      console.debug('protect middleware: attempting server JWT verify');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ message: "User not found" });

      if (user.status === "disabled") {
        return res.status(403).json({ message: "Account disabled. Contact admin." });
      }
      req.user = user;
      return next();
    } catch (error) {
      console.debug('protect middleware: server JWT verify failed:', error.message || error);
      // If JWT verification failed, try Firebase ID token (if firebase-admin configured)
      try {
        if (admin.apps.length) {
          console.debug('protect middleware: attempting firebase token verify');
          const firebaseDecoded = await admin.auth().verifyIdToken(token);
          // firebaseDecoded contains uid
          console.debug('protect middleware: firebase token verified, uid=', firebaseDecoded.uid);
          let user = await User.findOne({ firebaseUID: firebaseDecoded.uid }).select('-password');
          if (!user) {
            // Create a minimal user record in Mongo for this Firebase user
            const newUser = await User.create({
              firebaseUID: firebaseDecoded.uid,
              name: firebaseDecoded.name || firebaseDecoded.email || 'User',
              email: firebaseDecoded.email || `${firebaseDecoded.uid}@firebase.local`,
              role: 'user',
            });
            user = newUser;
          }
          if (user.status === 'disabled') {
            return res.status(403).json({ message: 'Account disabled. Contact admin.' });
          }
          req.user = user;
          return next();
        }
      } catch (fbErr) {
        console.error('Firebase verify error:', fbErr.message || fbErr);
      }
      res.status(401).json({ message: "Invalid token", error: error.message });
    }
  };