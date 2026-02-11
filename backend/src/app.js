const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api', require('./routes/taskRoutes'));


const pool = require('./config/db');

app.get('/api/health', async (req, res) => {
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const duration = Date.now() - start;

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      latency: `${duration}ms`
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      error: err.message
    });
  }
});

module.exports = app;