const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const authRoutes = require('./auth/auth');
const adminRoutes = require('./auth/admin');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Opt-in cleanup: set CLEAR_TEMP_ADMIN=true to remove the test admin on startup.
const pool = require('./config/db');
async function removeTempAdmin() {
  try {
    await pool.query(
      `DELETE FROM ems.auth_identities
       WHERE user_id IN (SELECT id FROM ems.users WHERE username = 'admin' OR email = 'admin@local')`
    );
    await pool.query(
      `DELETE FROM ems.users WHERE username = 'admin' OR email = 'admin@local'`
    );
    console.log('Temp admin cleanup executed.');
  } catch (e) {
    console.error('Error cleaning temp admin:', e);
  }
}

if (process.env.NODE_ENV !== 'production' && process.env.CLEAR_TEMP_ADMIN === 'true') {
  removeTempAdmin();
}

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// Auth Routes (before other routes)
app.use('/api/auth', authRoutes);

// Admin Routes (protected by requireAuth middleware)
app.use('/api/admin', adminRoutes);

// Other API Routes
app.use('/api/v1', routes);

// Root Test
app.get('/', (req, res) => {
  res.json({ message: 'EMS Backend Running' });
});

// Error Handler (MUST be last)
app.use(errorHandler);

module.exports = app;