import admin from 'firebase-admin';
import jwt from "jsonwebtoken";
import User from "../models/User.js"
// Only initialize Firebase if environment variables are available
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
        credential: admin.credential.cert({
           projectId: process.env.FIREBASE_PROJECT_ID,
           clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
           privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}
export const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized, no token" });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return res.status(401).json({ message: "User not found" });
  
      if (user.status === "disabled") {
        return res.status(403).json({ message: "Account disabled. Contact admin." });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token", error: error.message });
    }
  };