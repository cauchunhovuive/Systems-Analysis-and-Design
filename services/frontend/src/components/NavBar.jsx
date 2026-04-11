import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();

    if (!isAuthenticated) return null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow mb-4">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/dashboard">CRS System</Link>
                
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/dashboard">Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/courses">All Courses</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/enrollments">My Enrollments</Link>
                        </li>
                        {/* NÚT BẤM XEM LỊCH HỌC */}
                        <li className="nav-item">
                            <Link className="nav-link fw-bold text-info" to="/timetable">My Timetable</Link>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center">
                        <span className="text-light me-3 d-none d-lg-inline">Hi, {user?.full_name}</span>
                        <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;