// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Protected route: Only ADMIN can create staff accounts
router.post('/register', verifyToken, checkRole(['ADMIN']), authController.register);

// Public route
router.post('/register/student', authController.registerStudent);

router.post('/login', authController.login);

router.get('/user', verifyToken, authController.getUser);

module.exports = router;