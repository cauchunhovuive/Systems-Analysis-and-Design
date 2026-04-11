const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Tất cả các thao tác đăng ký chỉ dành cho STUDENT
router.use(authMiddleware);
router.use(roleMiddleware(['STUDENT']));

router.post('/', enrollmentController.createEnrollment);
router.get('/me', enrollmentController.getMyEnrollments);
router.delete('/:courseId', enrollmentController.deleteEnrollment);

module.exports = router;