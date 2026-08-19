const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const societyRoutes = require('./routes/societyRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const communityRoutes = require('./routes/communityRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Security & Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading uploaded images/PDFs across origins
}));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder for uploaded receipts and photos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Society Management System API',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/admin/societies', societyRoutes);
app.use('/api/admin', userRoutes);
app.use('/api/society', userRoutes);
app.use('/api/society/complaints', complaintRoutes);
app.use('/api/member/complaints', complaintRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/society/maintenance', maintenanceRoutes);
app.use('/api/member/maintenance', maintenanceRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/society/payments', paymentRoutes);
app.use('/api/member/payments', paymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/society/expenses', expenseRoutes);
app.use('/api/member/expenses', expenseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/society/notifications', notificationRoutes);
app.use('/api/member/notifications', notificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/society', communityRoutes);
app.use('/api/member', communityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// Fallback 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
