import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Timetable = () => {
    const[enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State để quản lý Popup (Modal)
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const DAYS =['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const HOURS =[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const HOUR_HEIGHT = 85;

    useEffect(() => {
        const fetchMyEnrollments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/enrollments/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setEnrollments(res.data.filter(e => e.status === 'SUCCESS'));
                setLoading(false);
            } catch (err) {
                console.error("Error fetching timetable:", err);
                setLoading(false);
            }
        };
        fetchMyEnrollments();
    },[]);

    const timeToMinutes = (timeString) => {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const getCourseStyle = (startTime, endTime) => {
        const startMins = timeToMinutes(startTime);
        const endMins = timeToMinutes(endTime);
        const calendarStartMins = 7 * 60;

        const top = ((startMins - calendarStartMins) / 60) * HOUR_HEIGHT;
        const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;

        return {
            position: 'absolute',
            top: `${top}px`,
            height: `${height}px`,
            width: '94%',
            left: '3%',
            zIndex: 10,
            cursor: 'pointer', // Thêm con trỏ chuột hình bàn tay để biết là bấm được
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s'
        };
    };

    // Hàm mở Modal
    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    // Hàm đóng Modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    if (loading) return <div className="container mt-5 text-center"><h3>Loading Timetable...</h3></div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">My Timetable</h2>
                <span className="badge bg-success p-2 fs-6">
                    <i className="bi bi-check-circle-fill me-2"></i>Confirmed Courses
                </span>
            </div>

            <div className="table-responsive shadow-lg rounded-3 bg-white border">
                <table className="table table-bordered mb-0" style={{ minWidth: '1000px', tableLayout: 'fixed' }}>
                    <thead className="table-light text-center">
                        <tr>
                            <th style={{ width: '80px', backgroundColor: '#f8f9fa' }}>Time</th>
                            {DAYS.map(day => <th key={day} className="text-primary">{day}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-0 bg-light">
                                <div style={{ position: 'relative', height: `${11 * HOUR_HEIGHT}px` }}>
                                    {HOURS.slice(0, -1).map((hour, index) => (
                                        <div key={hour} className="text-center text-muted fw-bold" 
                                             style={{ position: 'absolute', top: `${index * HOUR_HEIGHT}px`, width: '100%', height: `${HOUR_HEIGHT}px`, borderBottom: '1px solid #dee2e6', paddingTop: '5px', fontSize: '0.85rem' }}>
                                            {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                                        </div>
                                    ))}
                                </div>
                            </td>

                            {DAYS.map(day => {
                                const dayCourses = enrollments.filter(e => e.day_of_week === day);
                                return (
                                    <td key={day} className="p-0 align-top">
                                        <div style={{ position: 'relative', height: `${11 * HOUR_HEIGHT}px`, width: '100%' }}>
                                            {HOURS.slice(0, -1).map((hour, index) => (
                                                <div key={`grid-${hour}`} style={{ position: 'absolute', top: `${index * HOUR_HEIGHT}px`, width: '100%', height: `${HOUR_HEIGHT}px`, borderBottom: '1px dashed #f1f3f5' }}></div>
                                            ))}

                                            {dayCourses.map(course => (
                                                <div key={course.id} 
                                                     className="rounded shadow-sm border-start border-4 border-primary p-2 overflow-hidden bg-white course-block"
                                                     style={getCourseStyle(course.start_time, course.end_time)}
                                                     onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.15)'; }}
                                                     onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                     onClick={() => handleCourseClick(course)} // SỰ KIỆN CLICK VÀO MÔN HỌC
                                                >
                                                    <div className="fw-bold text-primary" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
                                                        {course.course_name}
                                                    </div>
                                                    <div className="text-dark fw-semibold mt-1" style={{ fontSize: '0.75rem' }}>
                                                        {course.course_code} ({course.group_code})
                                                    </div>
                                                    <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-clock-fill me-1"></i>
                                                        {course.start_time.substring(0,5)} - {course.end_time.substring(0,5)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* POPUP (MODAL) HIỂN THỊ CHI TIẾT MÔN HỌC */}
            {showModal && selectedCourse && (
                <>
                    {/* Lớp nền đen mờ */}
                    <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
                    
                    {/* Hộp thoại Modal */}
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }} onClick={closeModal}>
                        <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header bg-primary text-white border-0 rounded-top-4">
                                    <h5 className="modal-title fw-bold">
                                        <i className="bi bi-book-half me-2"></i>Course Details
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <h4 className="fw-bold text-dark mb-1">{selectedCourse.course_name}</h4>
                                    <p className="text-muted mb-4 fs-5">{selectedCourse.course_code}</p>
                                    
                                    <div className="row mb-3">
                                        <div className="col-5 text-muted fw-semibold">Lecturer:</div>
                                        <div className="col-7 fw-bold">{selectedCourse.lecturer_name}</div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-5 text-muted fw-semibold">Schedule:</div>
                                        <div className="col-7">
                                            <span className="badge bg-light text-dark border me-2">{selectedCourse.day_of_week}</span>
                                            {selectedCourse.start_time.substring(0,5)} - {selectedCourse.end_time.substring(0,5)}
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-5 text-muted fw-semibold">Group / Semester:</div>
                                        <div className="col-7">
                                            Group {selectedCourse.group_code} <span className="text-muted mx-1">|</span> {selectedCourse.semester}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-5 text-muted fw-semibold">Status:</div>
                                        <div className="col-7">
                                            <span className="badge bg-success px-3 py-2">
                                                <i className="bi bi-check-circle-fill me-1"></i> {selectedCourse.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary px-4" onClick={closeModal}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Timetable;