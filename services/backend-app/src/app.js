// src/app.js
const express = require('express');
const db = require('./config/db');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ["http://localhost:5173"],
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

// Use the routers with a base path
app.use('/', authRoutes);
app.use('/', courseRoutes);
app.use('/', enrollmentRoutes);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});