import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider'; // Lưu ý: ../ để ra ngoài thư mục src

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { handleLogIn } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogIn({ email, password });
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4 bg-light p-5 rounded shadow">
                    <h1 className="display-6 fw-bold mb-4 text-center">Central Authentication Service</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Email address</label>
                            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                        <div className="text-center mt-3">
                            <Link to="/register" className="text-decoration-none">Register a new student account</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;