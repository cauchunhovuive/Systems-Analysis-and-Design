// src/routes/admin.routes.js
const express = require('express');
const adminController = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Middleware dùng chung cho tất cả admin routes
const adminOnly = [verifyToken, checkRole(['ADMIN', 'ACADEMIC_OFFICE'])];

// ==================== COURSE MANAGEMENT ====================
router.get('/admin/courses', adminOnly, adminController.getAllCoursesAdmin);
router.post('/admin/courses', adminOnly, adminController.createCourse);
router.put('/admin/courses/:id', adminOnly, adminController.updateCourse);
router.delete('/admin/courses/:id', adminOnly, adminController.deleteCourse);
router.get('/admin/courses/:id/stats', adminOnly, adminController.getCourseStats);

// ==================== STUDENT MANAGEMENT ====================
router.get('/admin/students', adminOnly, adminController.getAllStudents);
router.get('/admin/students/:id', adminOnly, adminController.getStudentDetails);
router.put('/admin/students/:id', adminOnly, adminController.updateStudent);
router.delete('/admin/students/:id', adminOnly, adminController.deleteStudent);
router.get('/admin/students/:id/enrollments', adminOnly, adminController.getStudentEnrollments);

// ==================== ENROLLMENT MANAGEMENT ====================
router.get('/admin/enrollments', adminOnly, adminController.getAllEnrollments);
router.put('/admin/enrollments/:id/approve', adminOnly, adminController.approveEnrollment);
router.put('/admin/enrollments/:id/reject', adminOnly, adminController.rejectEnrollment);
router.delete('/admin/enrollments/:id', adminOnly, adminController.removeEnrollment);

// ==================== DASHBOARD & REPORTS ====================
router.get('/admin/dashboard', adminOnly, adminController.getDashboardOverview);
router.get('/admin/reports/enrollments/export', adminOnly, adminController.exportEnrollmentsCSV);
router.get('/admin/reports/students/export', adminOnly, adminController.exportStudentsCSV);
router.get('/admin/reports/courses/export', adminOnly, adminController.exportCoursesCSV);

// ==================== USER (STAFF) MANAGEMENT ====================
router.get('/admin/users', adminOnly, adminController.getAllStaff);
router.delete('/admin/users/:id', adminOnly, adminController.deleteUser);

module.exports = router;
