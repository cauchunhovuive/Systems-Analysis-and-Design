const db = require('../config/db');

const create = async ({ courseCode, courseName, description, capacity, lecturerName, dayOfWeek, startTime, endTime, level, semester, credit, courseType }) => {
    const { rows } = await db.query(
        'INSERT INTO courses (course_code, course_name, description, capacity, lecturer_name, day_of_week, start_time, end_time, level, semester, credit, course_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
        [courseCode, courseName, description, capacity, lecturerName, dayOfWeek, startTime, endTime, level, semester || 'HK2 2025-2026', credit || 3, courseType || 'Bắt buộc']
    );
    return rows[0];
};

const findAll = async (semester) => {
  try {
    if (semester) {
      const { rows } = await db.query(
        'SELECT id, course_code, course_name, lecturer_name, start_time, end_time, day_of_week, level, group_code, semester, credit, course_type FROM courses WHERE semester = $1 ORDER BY course_code',
        [semester]
      );
      return rows;
    }
    const { rows } = await db.query('SELECT id, course_code, course_name, lecturer_name, start_time, end_time, day_of_week, level, group_code, semester, credit, course_type FROM courses ORDER BY course_code');
    return rows;
  } catch (err) {
    console.error('Error in courseRepository.findAll:', err);
    throw err;
  }
};

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
  return rows[0];
};

const findByCode = async (courseCode) => {
  const { rows } = await db.query('SELECT * FROM courses WHERE course_code = $1', [courseCode]);
  return rows[0];
};

const remove = async (id) => {
  const { rows } = await db.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};

const update = async (id, { courseCode, courseName, description, capacity, lecturerName, dayOfWeek, startTime, endTime, level, semester, credit, courseType }) => {
  const existingCourse = await findById(id);
  if (!existingCourse) {
    return null;
  }

  const updatedData = {
    courseCode: courseCode || existingCourse.course_code,
    courseName: courseName || existingCourse.course_name,
    description: description || existingCourse.description,
    capacity: capacity || existingCourse.capacity,
    lecturerName: lecturerName || existingCourse.lecturer_name,
    dayOfWeek: dayOfWeek || existingCourse.day_of_week,
    startTime: startTime || existingCourse.start_time,
    endTime: endTime || existingCourse.end_time,
    level: level || existingCourse.level,
    semester: semester || existingCourse.semester,
    credit: credit || existingCourse.credit,
    courseType: courseType || existingCourse.course_type,
  };

  const { rows } = await db.query(
    'UPDATE courses SET course_code = $1, course_name = $2, description = $3, capacity = $4, lecturer_name = $5, day_of_week = $6, start_time = $7, end_time = $8, level = $9, semester = $10, credit = $11, course_type = $12 WHERE id = $13 RETURNING *',
    [
      updatedData.courseCode,
      updatedData.courseName,
      updatedData.description,
      updatedData.capacity,
      updatedData.lecturerName,
      updatedData.dayOfWeek,
      updatedData.startTime,
      updatedData.endTime,
      updatedData.level,
      updatedData.semester,
      updatedData.credit,
      updatedData.courseType,
      id,
    ]
  );
  return rows[0];
};

module.exports = {
  create,
  findAll,
  findById,
  findByCode,
  remove,
  update,
};