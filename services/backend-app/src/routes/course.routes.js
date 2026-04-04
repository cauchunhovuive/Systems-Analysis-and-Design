// src/routes/course.routes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// PROTECTED ROUTE: Only Academic Office can create a course.
router.post(
  '/api/courses',
  [verifyToken, checkRole(['ACADEMIC_OFFICE'])],
  courseController.create
);

// PROTECTED ROUTE: Only Academic Office can update a course.
router.put(
  '/api/courses/:id',
  [verifyToken, checkRole(['ACADEMIC_OFFICE'])],
  courseController.update
);

// PUBLICLY ACCESSIBLE ROUTE (for logged-in users): All users can view courses.
router.get('/api/courses', [verifyToken], courseController.getAll);
router.get('/api/courses/:id', [verifyToken], courseController.getById);

// PROTECTED ROUTE: Only Academic Office can delete a course.
router.delete(
  '/api/courses/:id',
  [verifyToken, checkRole(['ACADEMIC_OFFICE'])],
  courseController.remove
);

module.exports = router;