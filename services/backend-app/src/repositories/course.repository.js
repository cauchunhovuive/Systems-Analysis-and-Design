const db = require('../config/db');

const create = async ({ courseCode, courseName, description, capacity, lecturerName, dayOfWeek, startTime, endTime }) => { 
    const { rows } = await db.query( 'INSERT INTO courses (course_code, course_name, description, capacity, lecturer_name, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', 
        [courseCode, courseName, description, capacity, lecturerName, dayOfWeek, startTime, endTime] 
    ); 
    return rows[0]; 
};

const findAll = async () => {
  const { rows } = await db.query('SELECT id, course_code, course_name, lecturer_name, start_time, end_time, day_of_week FROM courses');
  return rows;
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

const update = async (id, { courseCode, courseName, description, capacity, lecturerName }) => {
  // Find the existing course first
  const existingCourse = await findById(id);
  if (!existingCourse) {
    return null; // Or throw an error, depending on desired handling
  }

  // Use existing values as fallback if new ones aren't provided
  const updatedData = {
    courseCode: courseCode || existingCourse.course_code,
    courseName: courseName || existingCourse.course_name,
    description: description || existingCourse.description,
    capacity: capacity || existingCourse.capacity,
    lecturerName: lecturerName || existingCourse.lecturer_name,
    dayOfWeek: dayOfWeek || existingCourse.day_of_week, 
    startTime: startTime || existingCourse.start_time, 
    endTime: endTime || existingCourse.end_time,
  };

  const { rows } = await db.query(
    'UPDATE courses SET course_code = $1, course_name = $2, description = $3, capacity = $4, lecturer_name = $5 WHERE id = $6, day_of_week = $7, start_time = $8, end_time = $9 WHERE id = $10 RETURNING **',
    [
      updatedData.courseCode,
      updatedData.courseName,
      updatedData.description,
      updatedData.capacity,
      updatedData.lecturerName,
      updatedData.dayOfWeek, 
      updatedData.startTime, 
      updatedData.endTime, 
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