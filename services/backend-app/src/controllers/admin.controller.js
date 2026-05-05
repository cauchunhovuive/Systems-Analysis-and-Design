// src/controllers/admin.controller.js
const adminService = require('../services/admin.service');

// ==================== COURSE MANAGEMENT ====================

const getAllCoursesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, level, semester } = req.query;
    const result = await adminService.getAllCoursesWithFilters({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      search,
      level,
      semester
    });
    res.status(200).json({ success: true, data: result.courses, pagination: { page: parseInt(page), limit: parseInt(limit), total: result.total, totalPages: Math.ceil(result.total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const course = await adminService.createNewCourse(req.body);
    res.status(201).json({ success: true, data: course, message: 'Tạo môn học thành công' });
  } catch (error) {
    res.status(409).json({ success: false, message: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await adminService.updateCourseDetails(req.params.id, req.body);
    res.status(200).json({ success: true, data: course, message: 'Cập nhật môn học thành công' });
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 409).json({ success: false, message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await adminService.deleteCourseById(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa môn học thành công' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getCourseStats = async (req, res) => {
  try {
    const stats = await adminService.getCourseWithStats(req.params.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT MANAGEMENT ====================

const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const result = await adminService.getAllStudentsWithFilters({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      search
    });
    res.status(200).json({ success: true, data: result.students, pagination: { page: parseInt(page), limit: parseInt(limit), total: result.total, totalPages: Math.ceil(result.total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const student = await adminService.getStudentWithDetails(req.params.id);
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await adminService.updateStudentInfo(req.params.id, req.body);
    res.status(200).json({ success: true, data: student, message: 'Cập nhật sinh viên thành công' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await adminService.deleteStudentById(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa sinh viên thành công' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await adminService.getStudentEnrollmentHistory(req.params.id);
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// ==================== ENROLLMENT MANAGEMENT ====================

const getAllEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, courseId, studentId, search } = req.query;
    const result = await adminService.getAllEnrollmentsWithFilters({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      status,
      courseId,
      studentId,
      search
    });
    res.status(200).json({ success: true, data: result.enrollments, pagination: { page: parseInt(page), limit: parseInt(limit), total: result.total, totalPages: Math.ceil(result.total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveEnrollment = async (req, res) => {
  try {
    const enrollment = await adminService.approveEnrollment(req.params.id);
    res.status(200).json({ success: true, data: enrollment, message: 'Đã duyệt đăng ký' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const rejectEnrollment = async (req, res) => {
  try {
    const enrollment = await adminService.rejectEnrollment(req.params.id);
    res.status(200).json({ success: true, data: enrollment, message: 'Đã từ chối đăng ký' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const removeEnrollment = async (req, res) => {
  try {
    await adminService.removeEnrollmentById(req.params.id);
    res.status(200).json({ success: true, message: 'Đã xóa đăng ký' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// ==================== USER (STAFF) MANAGEMENT ====================

const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const result = await adminService.getAllStaffWithFilters({
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      search
    });
    res.status(200).json({ 
      success: true, 
      data: result.staff, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total: result.total, 
        totalPages: Math.ceil(result.total / limit) 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await adminService.deleteUserById(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==================== DASHBOARD ====================

const getDashboardOverview = async (req, res) => {
  try {
    const overview = await adminService.getDashboardStats();
    res.status(200).json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPORT ====================

const exportEnrollmentsCSV = async (req, res) => {
  try {
    const csv = await adminService.generateEnrollmentsCSV();
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', 'attachment; filename="enrollments.csv"');
    res.status(200).send('\uFEFF' + csv); // BOM for UTF-8
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportStudentsCSV = async (req, res) => {
  try {
    const csv = await adminService.generateStudentsCSV();
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', 'attachment; filename="students.csv"');
    res.status(200).send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportCoursesCSV = async (req, res) => {
  try {
    const csv = await adminService.generateCoursesCSV();
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', 'attachment; filename="courses.csv"');
    res.status(200).send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCoursesAdmin, createCourse, updateCourse, deleteCourse, getCourseStats,
  getAllStudents, getStudentDetails, updateStudent, deleteStudent, getStudentEnrollments,
  getAllEnrollments, approveEnrollment, rejectEnrollment, removeEnrollment,
  getAllStaff, deleteUser,
  getDashboardOverview,
  exportEnrollmentsCSV, exportStudentsCSV, exportCoursesCSV
};
