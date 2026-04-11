const { Pool } = require('pg');
require('dotenv').config();

// Cấu hình kết nối lấy từ file .env
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'postgres-db',
    database: process.env.DB_NAME || 'crs_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Kiểm tra kết nối khi khởi động
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// XUẤT TRỰC TIẾP POOL
module.exports = pool;