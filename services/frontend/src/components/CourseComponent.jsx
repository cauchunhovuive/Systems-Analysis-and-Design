import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiClient } from '../config/api';

const CourseComponent = ({ course, enrollment }) => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
    const [localStatus, setLocalStatus] = useState(enrollment ? course.status : null);

	const getStatusBadge = (status) => {
		switch (status) {
			case "SUCCESS": return <span className="badge bg-success px-3 py-2 rounded-pill">Thành công</span>;
			case "PENDING": return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">Đang chờ xử lý</span>;
			case "FAILED": return <span className="badge bg-danger px-3 py-2 rounded-pill">Thất bại</span>;
            default: return null;
		}
	}

	const registerCourse = async () => {
        setIsLoading(true);
		try {
            await apiClient.post('/enrollments', { courseId: course.id });
            alert(`Đăng ký thành công học phần: ${course.course_name}`);
            setLocalStatus("SUCCESS");
        } catch (err) {
            alert(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setIsLoading(false);
        }
	};

	const unregisterCourse = async () => {
        if(!window.confirm(`Bạn có chắc chắn muốn hủy đăng ký môn ${course.course_name}?`)) return;
        
        setIsLoading(true);
		try {
            await apiClient.delete(`/enrollments/${course.id}`);
            alert(`Hủy đăng ký thành công.`);
            setLocalStatus(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Hủy đăng ký thất bại');
        } finally {
            setIsLoading(false);
        }
	};

    // Hide if unregistered from enrollments view
    if (enrollment && localStatus === null) return null;

	return (
		<div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100" style={{ transition: 'transform 0.2s', borderLeft: '5px solid #0d6efd !important' }}>
            <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style={{ borderLeft: '4px solid #0d6efd' }}>
                
                {/* Info Section */}
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-light border text-primary fw-bold px-2 py-1">{course.course_code}</span>
                        {enrollment && course.group_code && (
                            <span className="badge bg-light border text-secondary fw-bold px-2 py-1">Nhóm: {course.group_code}</span>
                        )}
                        {enrollment && getStatusBadge(localStatus)}
                    </div>
                    
                    <h5 className="fw-bold text-dark mb-3" style={{cursor: 'pointer'}} onClick={() => navigate(`/courses/${course.id}`)}>
                        {course.course_name}
                    </h5>
                    
                    <div className="row g-2 text-secondary small">
                        <div className="col-md-6 d-flex align-items-center gap-2">
                            <i className="bi bi-person-video3 text-primary"></i>
                            <span>GV: <span className="fw-semibold text-dark">{course.lecturer_name}</span></span>
                        </div>
                        <div className="col-md-6 d-flex align-items-center gap-2">
                            <i className="bi bi-clock-history text-primary"></i>
                            <span>Thời gian: <span className="fw-semibold text-dark">{course.start_time.substring(0,5)} - {course.end_time.substring(0,5)} ({course.day_of_week})</span></span>
                        </div>
                        {course.semester && (
                            <div className="col-md-6 d-flex align-items-center gap-2">
                                <i className="bi bi-calendar-event text-primary"></i>
                                <span>Học kỳ: <span className="fw-semibold text-dark">{course.semester}</span></span>
                            </div>
                        )}
                        {course.credit != null && (
                            <div className="col-md-6 d-flex align-items-center gap-2">
                                <i className="bi bi-award-fill text-primary"></i>
                                <span>Tín chỉ: <span className="fw-semibold text-dark">{course.credit}</span></span>
                            </div>
                        )}
                        {course.course_type && (
                            <div className="col-md-6 d-flex align-items-center gap-2">
                                <i className="bi bi-tags-fill text-primary"></i>
                                <span>Loại: <span className="fw-semibold text-dark">{course.course_type}</span></span>
                            </div>
                        )}
                        {course.level && (
                            <div className="col-md-6 d-flex align-items-center gap-2">
                                <i className="bi bi-bar-chart text-primary"></i>
                                <span>Cấp độ: <span className="fw-semibold text-dark">{course.level}</span></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Section */}
                <div className="d-flex flex-row flex-md-column gap-2 align-items-end mt-3 mt-md-0 border-start-md ps-md-4">
                    {!enrollment && (
                        <button 
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold w-100"
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            <i className="bi bi-info-circle me-1"></i> Chi tiết
                        </button>
                    )}
                    <button
                        className={`btn ${enrollment ? 'btn-outline-danger' : 'btn-primary'} btn-sm rounded-pill px-4 fw-bold w-100`}
                        onClick={() => { enrollment ? unregisterCourse() : registerCourse(); }}
                        disabled={isLoading || (!enrollment && localStatus === "SUCCESS")}
                    >
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : enrollment ? (
                            <><i className="bi bi-trash3 me-1"></i> Hủy lớp</>
                        ) : localStatus === "SUCCESS" ? (
                            <><i className="bi bi-check2-circle me-1"></i> Đã đăng ký</>
                        ) : (
                            <><i className="bi bi-plus-circle me-1"></i> Đăng ký</>
                        )}
                    </button>
                </div>
            </div>
		</div>
	);
};

export default CourseComponent;