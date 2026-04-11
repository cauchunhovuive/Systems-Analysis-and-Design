require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Đảm bảo đã có dòng này
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');

const app = express();

// CẤU HÌNH CORS CHO BACKEND
app.use(cors({
    origin: 'http://localhost:5173', // Cho phép Frontend gọi vào
    credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});