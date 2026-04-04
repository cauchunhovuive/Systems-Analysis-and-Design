const courseRepository = require('../repositories/course.repository');

const addCourse = async (courseData) => {
  const existingCourse = await courseRepository.findByCode(courseData.courseCode);
  if (existingCourse) {
    throw new Error('A course with this code already exists.');
  }
  return courseRepository.create(courseData);
};

const getAllCourses = async () => {
  return courseRepository.findAll();
};

const getCourseById = async (id) => {
  const course = await courseRepository.findById(id);
  if (!course) {
    throw new Error('Course not found.');
  }
  return course;
};

const deleteCourse = async (id) => {
  const deletedCourse = await courseRepository.remove(id);
  if (!deletedCourse) {
    throw new Error('Course not found.');
  }
  return deletedCourse;
};

const updateCourse = async (id, courseData) => {
  // 1. If a new course code is provided, check if it's already taken by another course
  if (courseData.courseCode) {
    const existingCourseWithCode = await courseRepository.findByCode(courseData.courseCode);
    // If a course with that code exists AND its ID is not the one we are trying to update...
    if (existingCourseWithCode && existingCourseWithCode.id !== parseInt(id, 10)) {
      throw new Error('A different course with this code already exists.');
    }
  }

  // 2. Perform the update
  const updatedCourse = await courseRepository.update(id, courseData);

  // 3. The repository returns null if the course wasn't found
  if (!updatedCourse) {
    throw new Error('Course not found.');
  }

  return updatedCourse;
};

module.exports = {
  addCourse,
  getAllCourses,
  getCourseById,
  deleteCourse,
  updateCourse,
};