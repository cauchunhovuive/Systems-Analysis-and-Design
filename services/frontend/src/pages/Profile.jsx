import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';

const Profile = () => {
    const { isAuthenticated, isAuthReady } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthReady && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthReady, isAuthenticated, navigate]);

    const getUser = async () => {
		const result = await apiClient.get('/user');
		return result.data.user;
    };

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['user'],
        queryFn: getUser,
        enabled: isAuthenticated,
        retry: false
    });

    const { handleLogout } = useAuth();

    React.useEffect(() => {
        if (isError) {
            handleLogout();
        }
    }, [isError, handleLogout]);

    if (isLoading || (!user && !isError)) return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="container py-5" style={{ marginTop: '60px', maxWidth: '800px', fontFamily: "'Inter', sans-serif" }}>
            <button className="btn btn-link text-decoration-none text-secondary p-0 mb-4 fw-semibold" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left me-2"></i>Quay lại
            </button>

            <h3 className="fw-bold text-primary border-bottom pb-3 mb-4">Hồ sơ cá nhân</h3>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="bg-light p-4 d-flex align-items-center gap-4">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${user.fullName}&background=1e3a8a&color=fff&size=128&font-size=0.4`} 
                        alt="Avatar" 
                        className="rounded-circle shadow-sm border border-3 border-white"
                        style={{ width: '100px', height: '100px' }}
                    />
                    <div>
                        <h4 className="fw-bold mb-1">{user.fullName}</h4>
                        <p className="text-muted mb-2">{user.email}</p>
                        <span className="badge bg-primary px-3 py-2 rounded-pill">Vai trò: {user.role}</span>
                    </div>
                </div>
                
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-person-lines-fill me-2 text-primary"></i>Thông tin liên hệ</h5>
                    
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold mb-1">Địa chỉ</label>
                            <p className="fw-semibold text-dark border p-2 rounded bg-light">{user.address || 'Chưa cập nhật'}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold mb-1">Số điện thoại</label>
                            <p className="fw-semibold text-dark border p-2 rounded bg-light">{user.phone || 'Chưa cập nhật'}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold mb-1">Ngày sinh</label>
                            <p className="fw-semibold text-dark border p-2 rounded bg-light">
                                {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                            </p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold mb-1">Ngày tham gia hệ thống</label>
                            <p className="fw-semibold text-dark border p-2 rounded bg-light">
                                {new Date(user.created_at).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="text-center">
                <button className="btn btn-outline-primary fw-bold px-4 py-2" onClick={() => alert('Tính năng cập nhật hồ sơ đang được phát triển!')}>
                    <i className="bi bi-pencil-square me-2"></i>Chỉnh sửa hồ sơ
                </button>
            </div>
        </div>
    );
};

export default Profile;
