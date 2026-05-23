import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';

const Profile = () => {
    const { isAuthenticated, isAuthReady, handleLogout, updateUser } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [editMode, setEditMode] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({ fullName: '', address: '', phone: '', dob: '' });

    useEffect(() => {
        if (isAuthReady && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthReady, isAuthenticated, navigate]);

    const getUser = async () => {
		const result = await apiClient.get('/auth/user');
		if (!result.data || !result.data.user) {
			throw new Error('User data not found');
		}
		return result.data.user;
    };

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['user'],
        queryFn: getUser,
        enabled: isAuthenticated,
        retry: false
    });

    React.useEffect(() => {
        if (isError) {
            handleLogout();
        }
    }, [isError, handleLogout]);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                address: user.address || '',
                phone: user.phone || '',
                dob: user.dob ? user.dob.slice(0, 10) : ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const response = await apiClient.put('/auth/user', {
                full_name: formData.fullName,
                phone: formData.phone,
                address: formData.address,
                dob: formData.dob || null
            });

            const updatedUser = response.data.user;
            queryClient.setQueryData(['user'], updatedUser);
            updateUser(updatedUser);
            setSuccessMsg('Cập nhật hồ sơ thành công');
            setEditMode(false);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Cập nhật không thành công');
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                address: user.address || '',
                phone: user.phone || '',
                dob: user.dob ? user.dob.slice(0, 10) : ''
            });
        }
        setErrorMsg('');
        setSuccessMsg('');
        setEditMode(false);
    };

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
                        <div className="col-12">
                            <label className="text-muted small fw-bold mb-1">Họ và tên</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Nhập họ và tên"
                                />
                            ) : (
                                <p className="fw-semibold text-dark border p-2 rounded bg-light">{user.fullName}</p>
                            )}
                        </div>
                        <div className="col-12">
                            <label className="text-muted small fw-bold mb-1">Email</label>
                            <p className="fw-semibold text-dark border p-2 rounded bg-light">{user.email}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold mb-1">Địa chỉ</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Nhập địa chỉ"
                                />
                            ) : (
                                <p className="fw-semibold text-dark border p-2 rounded bg-light">{user.address || 'Chưa cập nhật'}</p>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold mb-1">Số điện thoại</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Nhập số điện thoại"
                                />
                            ) : (
                                <p className="fw-semibold text-dark border p-2 rounded bg-light">{user.phone || 'Chưa cập nhật'}</p>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small fw-bold mb-1">Ngày sinh</label>
                            {editMode ? (
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                />
                            ) : (
                                <p className="fw-semibold text-dark border p-2 rounded bg-light">
                                    {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                </p>
                            )}
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
            
            {errorMsg && <div className="alert alert-danger py-2 small fw-semibold text-center">{errorMsg}</div>}
            {successMsg && <div className="alert alert-success py-2 small fw-semibold text-center">{successMsg}</div>}
            <div className="text-center">
                {editMode ? (
                    <>
                        <button className="btn btn-primary fw-bold px-4 py-2 me-3" onClick={handleSave}>
                            <i className="bi bi-save me-2"></i>Lưu thay đổi
                        </button>
                        <button className="btn btn-outline-secondary fw-bold px-4 py-2" onClick={handleCancel}>
                            Hủy
                        </button>
                    </>
                ) : (
                    <button className="btn btn-outline-primary fw-bold px-4 py-2" onClick={() => setEditMode(true)}>
                        <i className="bi bi-pencil-square me-2"></i>Chỉnh sửa hồ sơ
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
