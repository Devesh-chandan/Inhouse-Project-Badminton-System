require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./src/models');
const setupSockets = require('./src/sockets');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Pass io to routes via req
app.use((req, _res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth',        require('./src/routes/auth'));
app.use('/api/players',     require('./src/routes/players'));
app.use('/api/tournaments', require('./src/routes/tournaments'));
app.use('/api/matches',     require('./src/routes/matches'));
app.use('/api/scorecards',  require('./src/routes/scorecards'));
app.use('/api/analytics',   require('./src/routes/analytics'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

// Setup socket handlers
setupSockets(io);

// Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synced');
    }
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }
});

module.exports = { app, io };
