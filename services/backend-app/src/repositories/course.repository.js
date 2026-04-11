const pool = require('../config/db');

const CourseRepository = {
    findAll: async (searchTerm) => {
        let query = 'SELECT * FROM courses';
        let values = [];
        if (searchTerm) {
            query += ` WHERE course_name ILIKE $1 OR course_code ILIKE $1 OR lecturer_name ILIKE $1`;
            values.push(`%${searchTerm}%`);
        }
        query += ' ORDER BY created_at DESC';
        const result = await pool.query(query, values);
        return result.rows;
    },

    findById: async (id) => {
        const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
        return result.rows[0];
    },

    create: async (data) => {
        const { course_code, course_name, group_code, semester, academic_year, capacity, lecturer_name, day_of_week, start_time, end_time, level } = data;
        const query = `INSERT INTO courses (course_code, course_name, group_code, semester, academic_year, capacity, lecturer_name, day_of_week, start_time, end_time, level) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
        const res = await pool.query(query, [course_code, course_name, group_code, semester, academic_year, capacity, lecturer_name, day_of_week, start_time, end_time, level]);
        return res.rows[0];
    },

    update: async (id, data) => {
        const { course_name, capacity, lecturer_name, day_of_week, start_time, end_time } = data;
        const query = `UPDATE courses SET course_name=$1, capacity=$2, lecturer_name=$3, day_of_week=$4, start_time=$5, end_time=$6 WHERE id=$7 RETURNING *`;
        const res = await pool.query(query, [course_name, capacity, lecturer_name, day_of_week, start_time, end_time, id]);
        return res.rows[0];
    },

    delete: async (id) => {
        await pool.query('DELETE FROM courses WHERE id = $1', [id]);
        return true;
    }
};

module.exports = CourseRepository;