// src/app.js
require('dotenv').config();
const express = require('express');
const db = require('./config/db');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:8081", "http://localhost:8082"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[INCOMING REQUEST] Method: ${req.method}, URL: ${req.originalUrl}`);
  next(); // Pass the request to the next middleware/router
});

// Test the database connection on startup
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Successfully connected to the database. Server time:', res.rows[0].now);
  }
});

app.get('/', (req, res) => {
  res.send('Course Registration System API is running!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/test-courses', (req, res) => {
  db.query('SELECT * FROM courses LIMIT 5')
    .then(result => res.json({ success: true, count: result.rowCount, data: result.rows }))
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// Use the routers with a base path
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});