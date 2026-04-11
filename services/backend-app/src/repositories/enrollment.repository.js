const pool = require('../config/db');

const EnrollmentRepository = {
    findByStudentId: async (studentId) => {
        const query = `
            SELECT e.*, c.course_name, c.course_code, c.group_code, c.lecturer_name, 
                   c.day_of_week, c.start_time, c.end_time, c.semester
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = $1
            ORDER BY e.enrollment_date DESC
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    },

    create: async (studentId, courseId) => {
        // 1. KIỂM TRA XEM ĐÃ ĐĂNG KÝ CHƯA (Để tránh lỗi Duplicate Key)
        const checkExist = await pool.query(
            'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [studentId, courseId]
        );
        if (checkExist.rows.length > 0) {
            throw new Error('Bạn đã đăng ký môn học này rồi!');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 2. Khóa hàng môn học để check capacity
            const courseRes = await client.query(
                'SELECT capacity FROM courses WHERE id = $1 FOR UPDATE', 
                [courseId]
            );
            const capacity = courseRes.rows[0].capacity;

            // 3. Đếm số người đã SUCCESS
            const countRes = await client.query(
                'SELECT COUNT(*) FROM enrollments WHERE course_id = $1 AND status = $2',
                [courseId, 'SUCCESS']
            );
            const currentEnrolled = parseInt(countRes.rows[0].count);

            // 4. Xác định trạng thái
            const status = currentEnrolled < capacity ? 'SUCCESS' : 'PENDING';

            const insertRes = await client.query(
                'INSERT INTO enrollments (student_id, course_id, status) VALUES ($1, $2, $3) RETURNING *',
                [studentId, courseId, status]
            );

            await client.query('COMMIT');
            return insertRes.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    delete: async (studentId, courseId) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const deleteRes = await client.query(
                'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2 RETURNING status',
                [studentId, courseId]
            );

            if (deleteRes.rows.length > 0 && deleteRes.rows[0].status === 'SUCCESS') {
                const nextInLine = await client.query(
                    `SELECT id FROM enrollments WHERE course_id = $1 AND status = 'PENDING' 
                     ORDER BY enrollment_date ASC LIMIT 1 FOR UPDATE`,
                    [courseId]
                );
                if (nextInLine.rows.length > 0) {
                    await client.query("UPDATE enrollments SET status = 'SUCCESS' WHERE id = $1", [nextInLine.rows[0].id]);
                }
            }
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = EnrollmentRepository;