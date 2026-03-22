// ...existing code...
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const paymentRoutes = require('./routes/payment.routes');
const app = express();

// Configure CORS to allow only trusted origins from .env
// Add CORS_ORIGINS to your .env as a comma-separated list, e.g:
// CORS_ORIGINS=https://example.com,https://admin.example.com
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Automatically allow common local dev origins when not in production
const devOrigins = ['http://localhost:4200', 'http://127.0.0.1:4200'];
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? envOrigins
  : Array.from(new Set([...envOrigins, ...devOrigins]));

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (curl, Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Deny: return a CORS error
    return callback(new Error('CORS policy: This origin is not allowed.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔥 LOG ROUTE LOADING
console.log('Loading cart routes...');
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

console.log('Loading user routes...');
app.use('/api/users', require('./routes/user.routes'));

app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);

// Use DB URI from env if present; fallback to local
const mongoUri = process.env.DB_URI || 'mongodb://127.0.0.1:27017/ecommerce';
mongoose.connect(mongoUri)
  .then(() => {
    console.log(`MongoDB connected to ${mongoUri}`);
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch(err => console.error(err));
// ...existing code...