require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import middleware
const { initializeFirebase } = require('./config/firebase');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const menusRoutes = require('./routes/menus');
const tablesRoutes = require('./routes/tables');
const employeesRoutes = require('./routes/employees');
const schedulesRoutes = require('./routes/schedules');
const punchesRoutes = require('./routes/punches');
const invitesRoutes = require('./routes/invites');
const messagesRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Initialize Firebase
initializeFirebase();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:19000', 'http://localhost:3000', process.env.WEB_URL, process.env.MOBILE_URL].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/invites', invitesRoutes);

// Protected routes
app.use('/api/orders', authMiddleware, ordersRoutes);
app.use('/api/menus', authMiddleware, menusRoutes);
app.use('/api/tables', authMiddleware, tablesRoutes);
app.use('/api/employees', authMiddleware, employeesRoutes);
app.use('/api/schedules', authMiddleware, schedulesRoutes);
app.use('/api/punches', punchesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;

