const CourseRepository = require('../repositories/course.repository');

exports.getAllCourses = async (req, res) => {
    try {
        const { search } = req.query;
        const courses = await CourseRepository.findAll(search);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await CourseRepository.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const newCourse = await CourseRepository.create(req.body);
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// HÀM NÀY BỊ THIẾU LÚC TRƯỚC GÂY LỖI PUT
exports.updateCourse = async (req, res) => {
    try {
        const updated = await CourseRepository.update(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// HÀM NÀY BỊ THIẾU LÚC TRƯỚC GÂY LỖI DELETE
exports.deleteCourse = async (req, res) => {
    try {
        await CourseRepository.delete(req.params.id);
        res.json({ message: 'Xóa môn học thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};