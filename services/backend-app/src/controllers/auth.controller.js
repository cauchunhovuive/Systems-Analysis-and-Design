const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
    const { email, password, full_name } = req.body;
    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) return res.status(400).json({ message: 'Email đã tồn tại' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
            [email, hashedPassword, full_name, 'STUDENT']
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, full_name, role FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};