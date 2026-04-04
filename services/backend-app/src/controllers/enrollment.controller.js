// src/controllers/enrollment.controller.js
const enrollmentService = require('../services/enrollment.service');

const create = async (req, res) => {
  try {
    const studentId = req.user.id; // From our verifyToken middleware
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required.' });
    }

    const enrollment = await enrollmentService.enrollStudentInCourse(studentId, courseId);
    res.status(201).json(enrollment);
  } catch (error) {
    // Use 404 for 'Not Found' and 409 for conflicts (already registered/full)
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(409).json({ message: error.message });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id; // From our verifyToken middleware
    const enrollments = await enrollmentService.getStudentEnrollments(studentId);
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const studentId = req.user.id; // From our verifyToken middleware
    const enrollments = await enrollmentService.deleteEnrollment(studentId, req.params.id);
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create,
  getMyEnrollments,
  deleteEnrollment
};