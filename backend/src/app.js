const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const logger = require('./middleware/logger');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// API Routes
app.use('/api', routes);

// Root Test
app.get('/', (req, res) => {
  res.json({ message: 'EMS Backend Running' });
});

module.exports = app;