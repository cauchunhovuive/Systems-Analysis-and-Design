const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.login = async (email, password) => {
    // 1. Tìm user trong DB
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
        throw new Error('Email không tồn tại');
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Mật khẩu không đúng');
    }

    // 3. Tạo JWT Token dùng khóa bí mật từ .env
    const token = jwt.sign(
        { 
            id: user.id, 
            role: user.role,
            email: user.email 
        }, 
        process.env.JWT_SECRET, // Dùng biến môi trường
        { expiresIn: '24h' }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        }
    };
};