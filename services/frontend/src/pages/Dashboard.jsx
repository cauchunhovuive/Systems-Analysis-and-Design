import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from '../config/api';
import { useAuth } from '../AuthProvider';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) navigate("/login");
  }, [navigate, isAuthenticated]);

  const getUser = async () => {
		const result = await apiClient.get('/user');
		return result.data.user;
	};

	const getEnrollments = async () => {
		const result = await apiClient.get('/enrollments');
		return result.data.filter(e => e.status === 'SUCCESS');
	};

  const { data: user, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    enabled: isAuthenticated,
    retry: false
  });

  const { data: enrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: getEnrollments,
    enabled: isAuthenticated
  });

  const { handleLogout } = useAuth();

  const TOTAL_CREDITS = 162;
  const REQUIRED_CREDITS = 120;
  const ELECTIVE_CREDITS = 42;
  const DEFAULT_CREDIT_PER_COURSE = 3;
  const completedCredits = enrollments?.length ? enrollments.length * DEFAULT_CREDIT_PER_COURSE : 0;
  const progressPercent = Math.min(100, Math.round((completedCredits / TOTAL_CREDITS) * 100));
  const completedRequiredCredits = 0;
  const completedElectiveCredits = 0;

  useEffect(() => {
    if (isUserError) {
        handleLogout();
    }
  }, [isUserError, handleLogout]);

  if (isUserLoading || isEnrollmentsLoading || (!user && !isUserError)) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container py-5" style={{marginTop: '60px', maxWidth: '1200px'}}>
      
      {/* Row 1: Thong tin sinh vien & Nhac nho */}
      <div className="row g-4 mb-4">
        {/* Info Card */}
        <div className="col-lg-8">
          <div className="portal-card h-100 d-flex align-items-center">
            <div className="me-4 d-none d-sm-block">
              <img src={`https://ui-avatars.com/api/?name=${user.fullName}&background=1e3a8a&color=fff&size=128&font-size=0.4`} alt="Avatar" className="portal-avatar shadow-sm" />
            </div>
            <div className="w-100">
              <h5 className="fw-bold mb-3 border-bottom pb-2" style={{color: 'var(--color-primary)'}}>
                Thông tin cá nhân
              </h5>
              <div className="row">
                <div className="col-md-6 mb-2 mb-md-0">
                  <p className="mb-1 text-muted small">Họ và tên:</p>
                  <p className="fw-bold text-dark">{user.fullName}</p>
                  <p className="mb-1 text-muted small">Email / Tài khoản:</p>
                  <p className="fw-bold text-dark mb-0">{user.email}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 text-muted small">Vai trò:</p>
                  <p className="fw-bold mb-2">
                    <span className="badge bg-primary px-3 py-2 rounded-pill">{user.role}</span>
                  </p>
                  <p className="mb-1 text-muted small">Khoa:</p>
                  <p className="fw-bold text-dark mb-0">Công nghệ thông tin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Stats */}
        <div className="col-lg-4 d-flex flex-column gap-3">
          <div className="portal-card flex-fill d-flex justify-content-between align-items-center" style={{backgroundColor: '#fff', borderLeft: '4px solid #f59e0b'}}>
            <div>
              <p className="text-muted mb-1 fw-bold small text-uppercase">Nhắc nhở mới</p>
              <h2 className="mb-0 fw-bold" style={{color: '#f59e0b'}}>0</h2>
            </div>
            <div className="bg-light rounded-circle p-3">
              <i className="bi bi-bell-fill fs-4 text-warning"></i>
            </div>
          </div>
          <div className="portal-card flex-fill d-flex justify-content-between align-items-center" style={{backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderLeft: '4px solid #3b82f6'}}>
            <div>
              <p className="text-primary mb-1 fw-bold small text-uppercase">Lớp học phần (HK này)</p>
              <h2 className="mb-0 text-primary fw-bold">{enrollments?.length || 0}</h2>
            </div>
            <div className="bg-white rounded-circle p-3 shadow-sm">
              <i className="bi bi-journal-bookmark-fill fs-4 text-primary"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="action-btn" onClick={() => navigate('/timetable')}>
            <i className="bi bi-calendar3 action-icon"></i>
            <span className="fw-bold small text-center mt-1">Lịch học theo tuần</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="action-btn" onClick={() => navigate('/courses')}>
            <i className="bi bi-stack action-icon"></i>
            <span className="fw-bold small text-center mt-1">Đăng ký học phần</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="action-btn" onClick={() => navigate('/enrollments')}>
            <i className="bi bi-card-checklist action-icon"></i>
            <span className="fw-bold small text-center mt-1">Kết quả đăng ký</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="action-btn">
            <i className="bi bi-wallet2 action-icon"></i>
            <span className="fw-bold small text-center mt-1">Tra cứu học phí</span>
          </div>
        </div>
      </div>

      {/* Row 3: Detail Panels */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="portal-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-4">
              <h5 className="fw-bold mb-0">Lớp học phần đang học</h5>
              <span className="badge bg-light text-dark border">HK2 (2025-2026)</span>
            </div>
            
            {enrollments && enrollments.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="text-muted small text-uppercase">Mã MH</th>
                      <th className="text-muted small text-uppercase">Tên Môn Học</th>
                      <th className="text-muted small text-uppercase">Giảng Viên</th>
                      <th className="text-muted small text-uppercase text-center">Lịch Học</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map(course => (
                      <tr key={course.id}>
                        <td className="text-primary fw-bold" style={{fontSize: '0.9rem'}}>{course.course_code}</td>
                        <td className="fw-bold text-dark">{course.course_name}</td>
                        <td className="text-muted small">{course.lecturer_name}</td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border me-1">{course.day_of_week.substring(0,3)}</span> 
                          <small className="fw-semibold text-muted">{course.start_time.substring(0,5)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 text-muted bg-light rounded-3">
                <i className="bi bi-folder-x fs-1 mb-3 d-block text-secondary"></i>
                <p className="fw-semibold">Bạn chưa có dữ liệu lớp học phần nào</p>
                <button className="btn btn-primary mt-2 px-4 py-2 fw-bold" onClick={() => navigate('/courses')}>
                  Đăng ký ngay
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="portal-card h-100 text-center">
             <h5 className="fw-bold mb-4 border-bottom pb-3 text-start">Tiến độ học tập</h5>
             
             {/* Circular Progress Chart */}
             <div className="position-relative d-inline-block mt-4 mb-3" style={{width: '200px', height: '200px'}}>
                <svg viewBox="0 0 36 36" className="w-100 h-100">
                  {/* Background Circle */}
                  <path
                    className="text-light"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3.5"
                  />
                  {/* Foreground Circle */}
                  <path
                    className="text-primary"
                    strokeDasharray={`${progressPercent}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--color-primary-light)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{animation: 'progress 1.5s ease-out forwards'}}
                  />
                </svg>
                <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                  <h2 className="mb-0 fw-bold" style={{color: 'var(--color-primary)'}}>{`${completedCredits}/${TOTAL_CREDITS}`}</h2>
                  <span className="text-muted small fw-semibold">Tín chỉ</span>
                </div>
             </div>
             
             <div className="d-flex justify-content-between px-3 mt-4 text-start">
               <div>
                 <p className="mb-1 text-muted small fw-bold">Bắt buộc</p>
                 <p className="fw-bold text-dark mb-0">{`${completedRequiredCredits} / ${REQUIRED_CREDITS}`}</p>
               </div>
               <div className="text-end">
                 <p className="mb-1 text-muted small fw-bold">Tự chọn</p>
                 <p className="fw-bold text-dark mb-0">{`${completedElectiveCredits} / ${ELECTIVE_CREDITS}`}</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;