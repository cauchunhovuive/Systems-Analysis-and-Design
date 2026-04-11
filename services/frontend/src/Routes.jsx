import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Enrollments from './pages/Enrollments';
import Timetable from './pages/Timetable'; // 1. Import trang mới
import { useAuth } from './AuthProvider';

const AppRoutes = () => {
    const { isAuthenticated, isAuthReady } = useAuth();

    if (!isAuthReady) return <div className="text-center mt-5">Loading...</div>;

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" replace />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/courses" element={isAuthenticated ? <Courses /> : <Navigate to="/login" replace />} />
            <Route path="/enrollments" element={isAuthenticated ? <Enrollments /> : <Navigate to="/login" replace />} />
            <Route path="/timetable" element={isAuthenticated ? <Timetable /> : <Navigate to="/login" replace />} /> {/* 2. Thêm Route này */}
            
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;