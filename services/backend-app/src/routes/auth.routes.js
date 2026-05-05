// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Protected route: Only ADMIN can create staff accounts
router.post('/auth/register', verifyToken, checkRole(['ADMIN']), authController.register);

// Public route: Students can register themselves
router.post('/auth/register/student', authController.registerStudent);

router.post('/auth/login', authController.login);

router.get('/user', authController.getUser);

module.exports = router;