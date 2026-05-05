// src/controllers/auth.controller.js
const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Basic validation
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newUser = await authService.registerUser(email, password, fullName, role);
    res.status(201).json(newUser);
  } catch (error) {
    // Send a specific error if the email is taken
    res.status(409).json({ message: error.message }); // 409 Conflict
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    // Send a generic 401 Unauthorized for login failures
    res.status(401).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['token'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) {
      return res.status(400).json({ message: 'JWT token is required' });
    }
    const result = await authService.getUser(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

const registerStudent = async (req, res) => {
  try {
    // Note: We map full_name to fullName here to support frontend format
    const email = req.body.email;
    const password = req.body.password;
    const fullName = req.body.fullName || req.body.full_name;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Force role to be STUDENT
    const newUser = await authService.registerUser(email, password, fullName, 'STUDENT');
    res.status(201).json(newUser);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

module.exports = {
  register,
  registerStudent,
  login,
  getUser
};