import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../config/api';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        try {
            await apiClient.post('/auth/register/student', {
                email,
                password,
                full_name: fullName
            });
            setSuccessMsg('Đăng ký thành công! Đang chuyển hướng...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="min-vh-100 bg-white d-flex flex-column" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="py-4 bg-white border-bottom">
                <div className="container" style={{ maxWidth: '1100px' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white d-flex flex-column align-items-center justify-content-center rounded px-2 py-1" style={{ width: '60px', height: '60px' }}>
                            <i className="bi bi-stack fs-3 mb-0" style={{lineHeight: 1}}></i>
                            <small className="fw-bold" style={{fontSize: '0.65rem'}}>CRS</small>
                        </div>
                        <div className="d-flex flex-column text-start" style={{borderLeft: '2px solid #e5e7eb', paddingLeft: '15px'}}>
                            <span className="fw-bold fs-4 text-primary" style={{lineHeight: '1.2', color: '#0d6efd'}}>COURSE REGISTRATION</span>
                            <span className="fw-semibold text-secondary" style={{fontSize: '1rem', letterSpacing: '0.5px'}}>MANAGEMENT SYSTEM</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
                <div className="bg-white p-4 p-md-5 rounded shadow-sm border" style={{ maxWidth: '550px', width: '100%', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.05)' }}>
                    <div className="text-center mb-4">
                        <h5 className="fw-bold text-dark mb-1" style={{fontSize: '1.25rem'}}>CRS STUDENT PORTAL</h5>
                        <p className="text-secondary small mb-0">Tạo tài khoản sinh viên mới</p>
                    </div>

                    {errorMsg && <div className="alert alert-danger py-2 small fw-semibold text-center">{errorMsg}</div>}
                    {successMsg && <div className="alert alert-success py-2 small fw-semibold text-center">{successMsg}</div>}

                    <form onSubmit={handleRegister}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary mb-1">HỌ VÀ TÊN SINH VIÊN</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Nhập họ và tên đầy đủ"
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                required 
                                style={{padding: '0.6rem 0.75rem', fontSize: '0.9rem'}}
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary mb-1">EMAIL / MSSV</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                placeholder="Nhập email sinh viên"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                style={{padding: '0.6rem 0.75rem', fontSize: '0.9rem'}}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-secondary mb-1">MẬT KHẨU</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Tạo mật khẩu bảo mật"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                style={{padding: '0.6rem 0.75rem', fontSize: '0.9rem'}}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 fw-bold py-2 mb-3"
                            style={{ backgroundColor: '#0d6efd', border: 'none', borderRadius: '4px' }}
                        >
                            HOÀN TẤT ĐĂNG KÝ
                        </button>

                        <div className="text-center mt-2">
                            <span className="small text-secondary">Đã có tài khoản? </span>
                            <span 
                                className="small text-primary fw-bold" 
                                style={{cursor: 'pointer'}}
                                onClick={() => navigate('/login')}
                            >
                                Đăng nhập hệ thống
                            </span>
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="text-center py-3 bg-light border-top">
                <span className="small text-secondary">Hỗ trợ kỹ thuật: </span>
                <span className="small text-dark fw-bold">support@crs-system.edu</span>
            </div>
        </div>
    );
};

export default Register;