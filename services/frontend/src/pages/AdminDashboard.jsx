// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import AdminOverview from '../components/Admin/AdminOverview';
import CourseManagement from '../components/Admin/CourseManagement';
import StudentManagement from '../components/Admin/StudentManagement';
import EnrollmentManagement from '../components/Admin/EnrollmentManagement';
import UserManagement from '../components/Admin/UserManagement';

const tabs = [
  { key: 'overview',     icon: '📊', label: 'Tổng quan' },
  { key: 'courses',      icon: '📚', label: 'Quản lý Môn học' },
  { key: 'students',     icon: '👥', label: 'Quản lý Sinh viên' },
  { key: 'enrollments',  icon: '✍️', label: 'Quản lý Đăng ký' },
  { key: 'users',        icon: '🔐', label: 'Quản lý Tài khoản' },
];

export default function AdminDashboard() {
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');

  useEffect(() => {
    if (isAuthReady && (!user || (user.role !== 'ADMIN' && user.role !== 'ACADEMIC_OFFICE'))) {
      navigate('/');
    }
  }, [user, isAuthReady, navigate]);

  if (!isAuthReady || !user || (user.role !== 'ADMIN' && user.role !== 'ACADEMIC_OFFICE')) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  const roleLabel = user.role === 'ADMIN' ? '👑 Admin' : '🏫 Academic Office';

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fb' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white', padding: '24px 0'
      }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h2 className="mb-1 fw-bold">🖥️ Trang Quản Trị</h2>
              <p className="mb-0 opacity-75">
                Xin chào, <strong>{user.fullName}</strong> — <span className="badge bg-white text-primary">{roleLabel}</span>
              </p>
            </div>
            <div className="text-end">
              <small className="opacity-75">CRS Management System v2.0</small>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4" style={{ maxWidth: 1200 }}>
        <div className="row g-3">

          {/* Sidebar */}
          <div className="col-lg-2 col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-body p-2">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActive(tab.key)}
                    className={`btn w-100 text-start mb-1 ${active === tab.key ? 'btn-primary' : 'btn-light'}`}
                    style={{ borderRadius: 8, fontWeight: active === tab.key ? 600 : 400, fontSize: '0.85rem' }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-10 col-md-9">
            {active === 'overview'    && <AdminOverview />}
            {active === 'courses'     && <CourseManagement />}
            {active === 'students'    && <StudentManagement />}
            {active === 'enrollments' && <EnrollmentManagement />}
            {active === 'users'       && <UserManagement />}
          </div>

        </div>
      </div>
    </div>
  );
}
