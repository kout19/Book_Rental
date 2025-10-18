import adminRoutes from './routes/adminRoutes';
import bookRoutes from './routes/bookRoutes';
app.use('/api/admin', adminRoutes);
app.use('/api/books', bookRoutes);
export default app;