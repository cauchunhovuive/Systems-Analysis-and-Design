// src/services/admin.service.js
const db = require('../config/db');

// ==================== COURSE MANAGEMENT ====================

const getAllCoursesWithFilters = async ({ offset, limit, search, level, semester }) => {
  let where = 'WHERE 1=1';
  const params = [];
  let i = 1;

  if (search) {
    where += ` AND (course_code ILIKE $${i} OR course_name ILIKE $${i} OR group_code ILIKE $${i})`;
    params.push(`%${search}%`); i++;
  }
  if (level) {
    where += ` AND level = $${i}`;
    params.push(level); i++;
  }
  if (semester) {
    where += ` AND semester = $${i}`;
    params.push(semester); i++;
  }

  const countRes = await db.query(`SELECT COUNT(*) as count FROM courses ${where}`, params);
  const total = parseInt(countRes.rows[0].count);

  const dataRes = await db.query(
    `SELECT * FROM courses ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );

  return { courses: dataRes.rows, total };
};

const createNewCourse = async (data) => {
  const { course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level, semester, description } = data;
  const required = { course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level, semester };
  for (const [key, val] of Object.entries(required)) {
    if (!val) throw new Error(`Thiếu trường bắt buộc: ${key}`);
  }
  const res = await db.query(
    `INSERT INTO courses (course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level, semester, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level, semester, description || null]
  );
  return res.rows[0];
};

const updateCourseDetails = async (courseId, data) => {
  const check = await db.query('SELECT * FROM courses WHERE id=$1', [courseId]);
  if (!check.rows[0]) throw new Error('Course not found');

  const allowed = ['course_code','course_name','group_code','capacity','lecturer_name','day_of_week','start_time','end_time','level','semester','description'];
  const sets = [], vals = [];
  let i = 1;
  for (const key of allowed) {
    if (data[key] !== undefined) { sets.push(`${key}=$${i}`); vals.push(data[key]); i++; }
  }
  if (!sets.length) return check.rows[0];
  vals.push(courseId);
  const res = await db.query(`UPDATE courses SET ${sets.join(',')} WHERE id=$${i} RETURNING *`, vals);
  return res.rows[0];
};

const deleteCourseById = async (courseId) => {
  const check = await db.query('SELECT id FROM courses WHERE id=$1', [courseId]);
  if (!check.rows[0]) throw new Error('Course not found');
  await db.query('DELETE FROM courses WHERE id=$1', [courseId]);
};

const getCourseWithStats = async (courseId) => {
  const courseRes = await db.query('SELECT * FROM courses WHERE id=$1', [courseId]);
  if (!courseRes.rows[0]) throw new Error('Course not found');
  const course = courseRes.rows[0];

  const statsRes = await db.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status='SUCCESS' THEN 1 ELSE 0 END) as enrolled,
      SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status='FAILED' THEN 1 ELSE 0 END) as failed
     FROM enrollments WHERE course_id=$1`, [courseId]
  );
  const s = statsRes.rows[0];
  return {
    ...course,
    stats: {
      total: parseInt(s.total),
      enrolled: parseInt(s.enrolled),
      pending: parseInt(s.pending),
      failed: parseInt(s.failed),
      available: course.capacity - parseInt(s.enrolled),
      capacityPct: Math.round((parseInt(s.enrolled) / course.capacity) * 100)
    }
  };
};

// ==================== STUDENT MANAGEMENT ====================

const getAllStudentsWithFilters = async ({ offset, limit, search }) => {
  let where = "WHERE role='STUDENT'";
  const params = [];
  let i = 1;

  if (search) {
    where += ` AND (email ILIKE $${i} OR full_name ILIKE $${i})`;
    params.push(`%${search}%`); i++;
  }

  const countRes = await db.query(`SELECT COUNT(*) as count FROM users ${where}`, params);
  const total = parseInt(countRes.rows[0].count);

  const dataRes = await db.query(
    `SELECT id,email,full_name,phone,address,dob,created_at FROM users ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`,
    [...params, limit, offset]
  );

  return { students: dataRes.rows, total };
};

const getStudentWithDetails = async (studentId) => {
  const res = await db.query("SELECT id,email,full_name,phone,address,dob,created_at FROM users WHERE id=$1 AND role='STUDENT'", [studentId]);
  if (!res.rows[0]) throw new Error('Không tìm thấy sinh viên');
  return res.rows[0];
};

const updateStudentInfo = async (studentId, data) => {
  const check = await db.query("SELECT id FROM users WHERE id=$1 AND role='STUDENT'", [studentId]);
  if (!check.rows[0]) throw new Error('Không tìm thấy sinh viên');

  const allowed = ['full_name','phone','address','dob'];
  const sets = [], vals = [];
  let i = 1;
  for (const key of allowed) {
    if (data[key] !== undefined) { sets.push(`${key}=$${i}`); vals.push(data[key]); i++; }
  }
  if (!sets.length) return check.rows[0];
  vals.push(studentId);
  const res = await db.query(`UPDATE users SET ${sets.join(',')} WHERE id=$${i} RETURNING id,email,full_name,phone,address,dob`, vals);
  return res.rows[0];
};

const deleteStudentById = async (studentId) => {
  const check = await db.query("SELECT id FROM users WHERE id=$1 AND role='STUDENT'", [studentId]);
  if (!check.rows[0]) throw new Error('Không tìm thấy sinh viên');
  await db.query('DELETE FROM users WHERE id=$1', [studentId]);
};

// ==================== USER (STAFF) MANAGEMENT ====================

const getAllStaffWithFilters = async ({ offset, limit, search }) => {
  let where = "WHERE role IN ('ADMIN', 'ACADEMIC_OFFICE')";
  const params = [];
  let i = 1;

  if (search) {
    where += ` AND (email ILIKE $${i} OR full_name ILIKE $${i})`;
    params.push(`%${search}%`); i++;
  }

  const countRes = await db.query(`SELECT COUNT(*) as count FROM users ${where}`, params);
  const total = parseInt(countRes.rows[0].count);

  const dataRes = await db.query(
    `SELECT id, email, full_name, role, created_at FROM users ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`,
    [...params, limit, offset]
  );

  return { staff: dataRes.rows, total };
};

const deleteUserById = async (userId, requesterId) => {
  if (userId == requesterId) throw new Error('Bạn không thể tự xóa tài khoản của chính mình');
  
  const check = await db.query('SELECT role FROM users WHERE id=$1', [userId]);
  if (!check.rows[0]) throw new Error('Người dùng không tồn tại');
  
  await db.query('DELETE FROM users WHERE id=$1', [userId]);
};

const getStudentEnrollmentHistory = async (studentId) => {
  const res = await db.query(
    `SELECT e.id, e.status, e.enrollment_date, c.course_code, c.course_name, c.group_code, c.lecturer_name, c.day_of_week, c.start_time, c.end_time
     FROM enrollments e JOIN courses c ON e.course_id=c.id
     WHERE e.student_id=$1 ORDER BY e.enrollment_date DESC`, [studentId]
  );
  return res.rows;
};

// ==================== ENROLLMENT MANAGEMENT ====================

const getAllEnrollmentsWithFilters = async ({ offset, limit, status, courseId, studentId, search }) => {
  let where = 'WHERE 1=1';
  const params = [];
  let i = 1;

  if (status) { where += ` AND e.status=$${i}`; params.push(status); i++; }
  if (courseId) { where += ` AND e.course_id=$${i}`; params.push(courseId); i++; }
  if (studentId) { where += ` AND e.student_id=$${i}`; params.push(studentId); i++; }
  
  if (search) {
    where += ` AND (u.full_name ILIKE $${i} OR u.email ILIKE $${i} OR c.course_name ILIKE $${i} OR c.course_code ILIKE $${i})`;
    params.push(`%${search}%`); i++;
  }

  const baseQuery = `FROM enrollments e JOIN users u ON e.student_id=u.id JOIN courses c ON e.course_id=c.id ${where}`;

  const countRes = await db.query(`SELECT COUNT(*) as count ${baseQuery}`, params);
  const total = parseInt(countRes.rows[0].count);

  const dataRes = await db.query(
    `SELECT e.id, e.status, e.enrollment_date, u.full_name as student_name, u.email as student_email, c.course_code, c.course_name, c.group_code
     ${baseQuery} ORDER BY e.enrollment_date DESC LIMIT $${i} OFFSET $${i+1}`,
    [...params, limit, offset]
  );

  return { enrollments: dataRes.rows, total };
};

const approveEnrollment = async (enrollmentId) => {
  const check = await db.query('SELECT * FROM enrollments WHERE id=$1', [enrollmentId]);
  if (!check.rows[0]) throw new Error('Không tìm thấy đăng ký');
  if (check.rows[0].status === 'SUCCESS') throw new Error('Đăng ký đã được duyệt rồi');
  const res = await db.query("UPDATE enrollments SET status='SUCCESS' WHERE id=$1 RETURNING *", [enrollmentId]);
  return res.rows[0];
};

const rejectEnrollment = async (enrollmentId) => {
  const check = await db.query('SELECT id FROM enrollments WHERE id=$1', [enrollmentId]);
  if (!check.rows[0]) throw new Error('Không tìm thấy đăng ký');
  const res = await db.query("UPDATE enrollments SET status='FAILED' WHERE id=$1 RETURNING *", [enrollmentId]);
  return res.rows[0];
};

const removeEnrollmentById = async (enrollmentId) => {
  const check = await db.query('SELECT id FROM enrollments WHERE id=$1', [enrollmentId]);
  if (!check.rows[0]) throw new Error('Không tìm thấy đăng ký');
  await db.query('DELETE FROM enrollments WHERE id=$1', [enrollmentId]);
};

// ==================== DASHBOARD ====================

const getDashboardStats = async () => {
  const [students, courses, enrollments, pending] = await Promise.all([
    db.query("SELECT COUNT(*) as c FROM users WHERE role='STUDENT'"),
    db.query("SELECT COUNT(*) as c FROM courses"),
    db.query("SELECT COUNT(*) as c FROM enrollments"),
    db.query("SELECT COUNT(*) as c FROM enrollments WHERE status='PENDING'"),
  ]);

  const byStatus = await db.query("SELECT status, COUNT(*) as count FROM enrollments GROUP BY status");
  const byLevel = await db.query("SELECT level, COUNT(*) as count FROM courses GROUP BY level");
  const topCourses = await db.query(
    `SELECT c.course_name, c.course_code, COUNT(e.id) as enrolled
     FROM courses c LEFT JOIN enrollments e ON c.id=e.course_id AND e.status='SUCCESS'
     GROUP BY c.id ORDER BY enrolled DESC LIMIT 5`
  );
  const recent = await db.query(
    `SELECT e.id, e.status, e.enrollment_date, u.full_name as student_name, c.course_name
     FROM enrollments e JOIN users u ON e.student_id=u.id JOIN courses c ON e.course_id=c.id
     ORDER BY e.enrollment_date DESC LIMIT 5`
  );

  return {
    stats: {
      totalStudents: parseInt(students.rows[0].c),
      totalCourses: parseInt(courses.rows[0].c),
      totalEnrollments: parseInt(enrollments.rows[0].c),
      pendingEnrollments: parseInt(pending.rows[0].c),
    },
    charts: {
      enrollmentsByStatus: byStatus.rows,
      coursesByLevel: byLevel.rows,
      topCourses: topCourses.rows,
    },
    recentActivity: recent.rows,
  };
};

// ==================== EXPORT ====================

const generateEnrollmentsCSV = async () => {
  const res = await db.query(
    `SELECT e.id, u.full_name as student_name, u.email, c.course_code, c.course_name, c.group_code, e.status, e.enrollment_date
     FROM enrollments e JOIN users u ON e.student_id=u.id JOIN courses c ON e.course_id=c.id
     ORDER BY e.enrollment_date DESC`
  );
  const headers = ['ID','Tên sinh viên','Email','Mã môn','Tên môn','Nhóm','Trạng thái','Ngày đăng ký'];
  const rows = res.rows.map(r => [r.id, r.student_name, r.email, r.course_code, r.course_name, r.group_code, r.status, r.enrollment_date]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
};

const generateStudentsCSV = async () => {
  const res = await db.query(
    "SELECT id,full_name,email,phone,address,dob,created_at FROM users WHERE role='STUDENT' ORDER BY created_at DESC"
  );
  const headers = ['ID','Họ tên','Email','Điện thoại','Địa chỉ','Ngày sinh','Ngày tạo'];
  const rows = res.rows.map(r => [r.id, r.full_name, r.email, r.phone||'', r.address||'', r.dob||'', r.created_at]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
};

const generateCoursesCSV = async () => {
  const res = await db.query('SELECT * FROM courses ORDER BY course_code');
  const headers = ['ID','Mã môn','Tên môn','Nhóm','Sĩ số','Giảng viên','Thứ','Bắt đầu','Kết thúc','Cấp','Học kỳ'];
  const rows = res.rows.map(r => [r.id, r.course_code, r.course_name, r.group_code, r.capacity, r.lecturer_name, r.day_of_week, r.start_time, r.end_time, r.level, r.semester]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
};

module.exports = {
  getAllCoursesWithFilters, createNewCourse, updateCourseDetails, deleteCourseById, getCourseWithStats,
  getAllStudentsWithFilters, getStudentWithDetails, updateStudentInfo, deleteStudentById, getStudentEnrollmentHistory,
  getAllEnrollmentsWithFilters, approveEnrollment, rejectEnrollment, removeEnrollmentById,
  getAllStaffWithFilters, deleteUserById,
  getDashboardStats,
  generateEnrollmentsCSV, generateStudentsCSV, generateCoursesCSV
};
