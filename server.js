require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// ✅ Import routes
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const reportRoutes = require('./routes/reportRoutes'); // 👈 new import
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = db && db.threadId ? 'connected' : 'initialized';
  res.json({ status: 'ok', db: dbStatus, time: new Date().toISOString() });
});

// ✅ Mount student routes
app.use('/api/students', studentRoutes);

// ✅ Mount course routes
app.use('/api/courses', courseRoutes);

// ✅ Mount report routes
app.use('/api', reportRoutes); // 👈 now accessible via /api/reports

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
