// src/controllers/course.controller.js
const courseService = require('../services/course.service');

const create = async (req, res) => {
  try {
    const course = await courseService.addCourse(req.body);
    res.status(201).json(course);
  } catch (error) {
    // 409 Conflict is appropriate for duplicate data
    res.status(409).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.status(200).json(course);
  } catch (error) {
    // 404 Not Found is appropriate when the item doesn't exist
    res.status(404).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id);
    // 204 No Content is the standard successful response for a DELETE request
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const updatedCourse = await courseService.updateCourse(req.params.id, req.body);
    res.status(200).json(updatedCourse);
  } catch (error) {
    // Distinguish between "not found" and other errors like "code already exists"
    if (error.message === 'Course not found.') {
      return res.status(404).json({ message: error.message });
    }
    // 409 Conflict for duplicate data
    return res.status(409).json({ message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  getById,
  remove,
  update,
};