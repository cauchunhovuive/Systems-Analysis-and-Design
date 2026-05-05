import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from '../config/api';
import { useEffect } from "react";

const Course = () => {
	const { id } = useParams();
    const navigate = useNavigate();
	const { isAuthenticated, isAuthReady } = useAuth();

	useEffect(() => {
		if (isAuthReady && !isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthReady, isAuthenticated, navigate]);

	const getCourse = async () => {
		const result = await apiClient.get(`/courses/${id}`);
		return result.data;
	}

	const { data: course, isLoading, isError } = useQuery({
		queryKey: ['course', id],
		queryFn: getCourse,
		staleTime: 15 * 60 * 1000,
		enabled: isAuthenticated,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false
	});

	if (isLoading) return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
        </div>
    );
	if (isError || !course) return <div className="p-5 text-center text-danger fw-bold mt-5">Không tìm thấy thông tin môn học.</div>;

	return (
		<div className="container py-5" style={{marginTop: '60px', maxWidth: '900px', fontFamily: "'Inter', sans-serif"}}>
            
            <button className="btn btn-link text-decoration-none text-secondary p-0 mb-4 fw-semibold" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i>Quay lại
            </button>

			<div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="bg-primary text-white p-4 p-md-5">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-bold border border-white">
                            {course.course_code}
                        </span>
                        <span className="badge bg-primary border border-white text-white px-3 py-2 rounded-pill fw-bold">
                            Cấp độ: {course.level}
                        </span>
                    </div>
                    <h2 className='fw-bold mb-0 lh-base'>{course.course_name}</h2>
                </div>
                
                <div className="card-body p-4 p-md-5">
                    <h5 className="fw-bold border-bottom pb-3 mb-4 text-dark">Chi tiết học phần</h5>
                    
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary">
                                    <i className="bi bi-person-video3 fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted small fw-bold mb-1">GIẢNG VIÊN PHỤ TRÁCH</p>
                                    <p className="fw-bold text-dark fs-5 mb-0">{course.lecturer_name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary">
                                    <i className="bi bi-calendar-event fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted small fw-bold mb-1">LỊCH HỌC</p>
                                    <p className="fw-bold text-dark fs-5 mb-0">{course.day_of_week}</p>
                                    <p className="text-secondary mb-0">{course.start_time.substring(0,5)} - {course.end_time.substring(0,5)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary">
                                    <i className="bi bi-people-fill fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted small fw-bold mb-1">SỐ LƯỢNG SINH VIÊN</p>
                                    <p className="fw-bold text-dark fs-5 mb-0">Tối đa: {course.capacity}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary">
                                    <i className="bi bi-tags-fill fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted small fw-bold mb-1">NHÓM HỌC / TỔ THỰC HÀNH</p>
                                    <p className="fw-bold text-dark fs-5 mb-0">{course.group_code}</p>
                                </div>
                            </div>
                        </div>

                        {course.credit != null && (
                        <div className="col-md-6">
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary">
                                    <i className="bi bi-award-fill fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted small fw-bold mb-1">TÍN CHỈ</p>
                                    <p className="fw-bold text-dark fs-5 mb-0">{course.credit}</p>
                                </div>
                            </div>
                        </div>) }

                        {course.course_type && (
                        <div className="col-md-6">
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary">
                                    <i className="bi bi-award fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted small fw-bold mb-1">LOẠI MÔN HỌC</p>
                                    <p className="fw-bold text-dark fs-5 mb-0">{course.course_type}</p>
                                </div>
                            </div>
                        </div>)}

                        <div className="col-md-6">
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary">
                                    <i className="bi bi-calendar-event fs-4"></i>
                                </div>
                                <div>
                                    <p className="text-muted small fw-bold mb-1">HỌC KỲ</p>
                                    <p className="fw-bold text-dark fs-5 mb-0">{course.semester || 'Chưa xác định'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 text-center">
                        <p className="text-muted small">Để đăng ký môn học này, vui lòng quay lại trang danh sách học phần.</p>
                    </div>
                </div>
			</div>
		</div>
	);
};

export default Course;