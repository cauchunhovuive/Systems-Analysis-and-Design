const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Kiểm tra kỹ: courseController.getAllCourses phải tồn tại
router.get('/', authMiddleware, courseController.getAllCourses);
router.get('/:id', authMiddleware, courseController.getCourseById);

router.post('/', 
    authMiddleware, 
    roleMiddleware(['ACADEMIC_OFFICE', 'ADMIN']), 
    courseController.createCourse
);

router.put('/:id', 
    authMiddleware, 
    roleMiddleware(['ACADEMIC_OFFICE', 'ADMIN']), 
    courseController.updateCourse
);

router.delete('/:id', 
    authMiddleware, 
    roleMiddleware(['ACADEMIC_OFFICE', 'ADMIN']), 
    courseController.deleteCourse
);

module.exports = router;