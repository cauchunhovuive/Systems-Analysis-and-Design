import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast'; // Đã giữ lại Toast

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCourses = async (search = '') => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/courses?search=${search}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourses(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCourses(searchTerm);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleRegister = async (courseId) => {
        const tId = toast.loading('Processing registration...');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/enrollments`, 
                { course_id: courseId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            toast.dismiss(tId);
            if (res.data.data && res.data.data.status === 'SUCCESS') {
                toast.success(res.data.message);
            } else {
                toast(res.data.message, { icon: '⏳', style: { background: '#fff3cd', color: '#856404' } });
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error(err.response?.data?.message || "Registration failed");
        }
    };

    if (loading) return <div className="container mt-5 text-center"><h3>Loading courses...</h3></div>;

    return (
        <div className="container mt-5">
            {/* Phần tiêu đề và ô Search nằm cùng 1 hàng giống bản đẹp */}
            <div className="row mb-4 align-items-center">
                <div className="col-md-6">
                    <h2 className="fw-bold text-dark">Available Courses</h2>
                </div>
                <div className="col-md-6">
                    <input 
                        type="text" 
                        className="form-control w-75 ms-auto shadow-sm" 
                        placeholder="Search by name, code or lecturer..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Danh sách Card môn học */}
            <div className="row">
                {courses.map(course => (
                    <div className="col-md-4 mb-4" key={course.id}>
                        <div className="card shadow-sm border-0 h-100">
                            
                            {/* Thanh màu xanh ở đầu Card */}
                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
                                <span className="fw-bold">{course.course_code || 'N/A'}</span>
                                <span className="badge bg-white text-primary">{course.semester || 'HK1'}</span>
                            </div>

                            <div className="card-body d-flex flex-column">
                                <h4 className="card-title fw-bold mb-1">{course.course_name}</h4>
                                <p className="text-muted mb-1 small">
                                    <i className="bi bi-person-fill me-1"></i> {course.lecturer_name}
                                </p>
                                <p className="text-muted mb-3 small">
                                    <i className="bi bi-clock-fill me-1"></i> {course.day_of_week} ({course.start_time?.substring(0,5)} - {course.end_time?.substring(0,5)})
                                </p>
                                
                                <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top">
                                    <div>
                                        <span className="text-muted small d-block">Capacity</span>
                                        <span className="fw-bold fs-5">{course.capacity}</span>
                                    </div>
                                    <button 
                                        className="btn btn-primary px-4 fw-bold"
                                        onClick={() => handleRegister(course.id)}
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="text-center mt-5 py-5 bg-light rounded">
                    <p className="text-muted fs-5">No courses found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default Courses;