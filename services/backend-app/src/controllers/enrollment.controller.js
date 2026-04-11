const EnrollmentRepository = require('../repositories/enrollment.repository');

exports.createEnrollment = async (req, res) => {
    try {
        const { course_id } = req.body;
        const student_id = req.user.id; // Lấy từ token

        const enrollment = await EnrollmentRepository.create(student_id, course_id);
        
        const message = enrollment.status === 'SUCCESS' 
            ? 'Đăng ký môn học thành công!' 
            : 'Lớp đã đầy, bạn đã được đưa vào hàng chờ (Waitlist).';
            
        res.status(201).json({ message, data: enrollment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await EnrollmentRepository.findByStudentId(req.user.id);
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEnrollment = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        await EnrollmentRepository.delete(studentId, courseId);
        res.json({ message: 'Đã hủy đăng ký môn học. Hàng chờ đã được cập nhật.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};