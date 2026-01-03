const express = require('express');
const cors = require('cors');
require('dotenv').config();
const healthRoutes = require("./routes/health");

const authRoutes = require('./routes/authRoutes');

const app = express();

const allowedOrigins = [
  "http://frontend:3000",   // Docker network
  "http://localhost:3000",  // React prod build
  "http://localhost:5173"   // Vite dev server (YOUR CURRENT)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api", healthRoutes);

app.get('/api/health', async (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'connected',
  });
});

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

module.exports = app;