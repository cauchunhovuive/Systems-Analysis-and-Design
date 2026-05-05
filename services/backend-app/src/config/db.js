// src/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// We export a query function that will be used throughout the application
module.exports = {
  query: (text, params) => pool.query(text, params),
};