// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// In the next step, we will add middleware here to protect this route.
// For now, it is open so we can create our first admin user.
router.post('/api/auth/register', authController.register);

router.post('/api/auth/login', authController.login);

router.get('/api/user', authController.getUser);

module.exports = router;