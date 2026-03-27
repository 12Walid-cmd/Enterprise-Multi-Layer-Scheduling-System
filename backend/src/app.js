const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger); // Log all incoming requests

// API Routes
app.use('/api', routes);

// Root Test
app.get('/', (req, res) => {
  res.json({ message: 'EMS Backend Running' });
});

// Global Error Handler
// Must be registered last so it catches errors from all routes
app.use(errorHandler);

module.exports = app;