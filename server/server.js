require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// ─── Request Logging ───
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ─── API Routes ───
app.use('/api', apiRoutes);

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Connect to MongoDB and Start Server ───
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Acharya Campus Navigator API Server`);
    console.log(`   Running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
});
