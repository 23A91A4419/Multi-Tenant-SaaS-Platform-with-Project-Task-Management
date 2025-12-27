const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');


const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);


app.get('/api/health', async (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'connected',
  });
});

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);


module.exports = app;
