// src/repositories/enrollment.repository.js
const db = require('../config/db');

/**
 * Creates a new enrollment record.
 * @param {number} studentId
 * @param {number} courseId
 * @returns {Promise<object>} The new enrollment record.
 */
const create = async (studentId, courseId) => {
  const { rows } = await db.query(
    'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
    [studentId, courseId]
  );
  return rows[0];
};

/**
 * Counts how many students are enrolled in a specific course.
 * @param {number} courseId
 * @returns {Promise<number>} The number of enrollments.
 */
const countByCourseId = async (courseId) => {
  const { rows } = await db.query('SELECT COUNT(*) FROM enrollments WHERE course_id = $1', [courseId]);
  return parseInt(rows[0].count, 10);
};

/**
 * Finds a specific enrollment record for a student in a course.
 * @param {number} studentId
 * @param {number} courseId
 * @returns {Promise<object|undefined>} The enrollment record or undefined.
 */
const findByStudentAndCourse = async (studentId, courseId) => {
  const { rows } = await db.query(
    'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [studentId, courseId]
  );
  return rows[0];
};

/**
 * Finds all courses a specific student is enrolled in.
 * This function JOINS with the courses table to return full course details.
 * @param {number} studentId
 * @returns {Promise<Array<object>>} A list of course objects.
 */
const findCoursesByStudentId = async (studentId) => {
  const { rows } = await db.query(
    `SELECT 
     c.id, c.course_code, c.course_name, c.group_code, c.lecturer_name, c.level, c.day_of_week, c.start_time, c.end_time, e.status
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE e.student_id = $1`,
    [studentId]
  );
  return rows;
};

const deleteEnrollment = async (studentId, courseId) => {
  const { result } = await db.query(`DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2`, [studentId, courseId]);
  return result;
}

module.exports = {
  create,
  countByCourseId,
  findByStudentAndCourse,
  findCoursesByStudentId,
  deleteEnrollment
};