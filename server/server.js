const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const apiRoutes = require('./routes');
const { getRoot } = require('./controllers/healthController');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

// CORS configuration for the existing Vite frontend (supports localhost and 127.0.0.1)
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint: GET /
app.get('/', getRoot);

// API endpoints mounted at /api
app.use('/api', apiRoutes);

// Catch-all 404 handler for undefined endpoints
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

// Start server listening on configured port when executed directly
const PORT = config.port;
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`The Wall Backend server is running on http://localhost:${PORT} [${config.nodeEnv}]`);
  });
}

module.exports = app;
module.exports.app = app;
if (server) {
  module.exports.server = server;
}
