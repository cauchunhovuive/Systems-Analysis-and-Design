// src/services/enrollment.service.js
const enrollmentRepository = require('../repositories/enrollment.repository');
const courseRepository = require('../repositories/course.repository');

// Helper function for clarity
const doSchedulesOverlap = (courseA, courseB) => {
  if (courseA.day_of_week !== courseB.day_of_week) {
    return false; // Different days, no overlap
  }
  // Classic interval overlap condition: (StartA < EndB) and (EndA > StartB)
  return courseA.start_time < courseB.end_time && courseA.end_time > courseB.start_time;
};

const enrollStudentInCourse = async (studentId, courseId) => {
  // 1. Get details of the course to enroll in
  const courseToEnroll = await courseRepository.findById(courseId);
  if (!courseToEnroll) {
    throw new Error('Course not found.');
  }

  // 2. VALIDATION: Check for capacity
  const currentEnrollmentCount = await enrollmentRepository.countByCourseId(courseId);
  if (currentEnrollmentCount >= courseToEnroll.capacity) {
    throw new Error('Registration failed: Course is full.');
  }

  // 3. VALIDATION: Check for duplicate registration
  const existingEnrollment = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
  if (existingEnrollment) {
    throw new Error('You are already registered for this course.');
  }

  // 4. VALIDATION: Check for schedule overlaps
  const studentEnrolledCourses = await enrollmentRepository.findCoursesByStudentId(studentId);
  for (const enrolledCourse of studentEnrolledCourses) {
    if (doSchedulesOverlap(courseToEnroll, enrolledCourse)) {
      throw new Error(
        `Schedule conflict: This course conflicts with ${enrolledCourse.course_code} (${enrolledCourse.day_of_week} ${enrolledCourse.start_time}-${enrolledCourse.end_time}).`
      );
    }
  }

  // 5. If all checks pass, create the enrollment
  return enrollmentRepository.create(studentId, courseId);
};

/**
 * Gets all courses a student is enrolled in.
 * @param {number} studentId
 */
const getStudentEnrollments = async (studentId) => {
  return enrollmentRepository.findCoursesByStudentId(studentId);
};

const deleteEnrollment = async (studentId, courseId) => {
  try {
    return enrollmentRepository.deleteEnrollment(studentId, courseId);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  enrollStudentInCourse,
  getStudentEnrollments,
  deleteEnrollment
};