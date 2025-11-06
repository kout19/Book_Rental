import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import paymentsRoutes from './routes/paymentsRoutes.js';
import aiController from './controllers/aiController.js';
import aiRoutes from './routes/aiRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
// Increase JSON body size to allow base64 file uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Routes
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/books", bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/ai', (await import('./routes/aiRoutes.js')).default);

// Port from .env or default 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
export default app;
