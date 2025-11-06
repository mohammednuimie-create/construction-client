const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load .env file explicitly from server directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug: Log environment variables (only first few chars for security)
console.log('Environment check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'MISSING');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET (' + process.env.GOOGLE_CLIENT_SECRET.length + ' chars)' : 'MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration - يسمح بالوصول من أي مصدر في Production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? '*' // في Production، اتركه مفتوحاً أو ضع Domains محددة
    : 'http://localhost:3000', // في Development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// زيادة حد حجم الطلب لدعم الصور الكبيرة (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/construction-management';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Construction Management API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check environment variables (safe for production - no secrets exposed)
app.get('/api/debug/env', (req, res) => {
  res.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'MISSING',
    googleClientIdLength: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.length : 0,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    googleClientSecretPrefix: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...' : 'MISSING',
    googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.length : 0,
    frontendUrl: process.env.FRONTEND_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    port: process.env.PORT || 'NOT SET',
    mongodbConnected: mongoose.connection.readyState === 1
  });
});

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');
const materialRoutes = require('./routes/materials');
const supplierRoutes = require('./routes/suppliers');
const purchaseRoutes = require('./routes/purchases');
const paymentRoutes = require('./routes/payments');
const issueRoutes = require('./routes/issues');
const contractRoutes = require('./routes/contracts');
const requestRoutes = require('./routes/requests');
const reportRoutes = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler - يجب أن يكون بعد جميع routes
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: 'Request not found',
    url: req.originalUrl,
    method: req.method,
    data: {}
  });
});

// Error handler - يجب أن يكون بعد 404 handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Server error',
    message: err.message 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

