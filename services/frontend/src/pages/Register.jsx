import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/auth/register`, {
                email,
                password,
                full_name: fullName
            });
            alert('Đăng ký thành công! Hãy đăng nhập.');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 bg-light p-5 rounded shadow">
                    <h2 className="mb-4 text-center">Create Student Account</h2>
                    <form onSubmit={handleRegister}>
                        <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email address</label>
                            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-success w-100 mb-3">Register</button>
                        <p className="text-center">
                            Already have an account? <Link to="/login">Login here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;