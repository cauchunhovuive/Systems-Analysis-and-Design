import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../AuthProvider';

const Dashboard = () => {
    const { user: contextUser, logout } = useAuth(); // Lấy user từ AuthContext
    const [serverUser, setServerUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                logout();
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/auth/user`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // Nếu tìm thấy user trên server thì ưu tiên dùng
                if (response.data) {
                    setServerUser(response.data);
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                if (error.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [logout]);

    // Ưu tiên dùng dữ liệu từ Server, nếu không có thì dùng từ Context (localStorage)
    const displayUser = serverUser || contextUser;

    if (loading && !displayUser) return <div className="container mt-5 text-center"><h3>Loading...</h3></div>;

    return (
        <div className="container mt-5">
            <div className="card shadow-lg border-0 rounded-4 p-4">
                <h1 className="text-primary fw-bold">Student Dashboard</h1>
                <hr />
                {displayUser ? (
                    <div className="mt-4">
                        <h2 className="mb-3 text-dark">Welcome back, <span className="text-primary">{displayUser.full_name}</span>!</h2>
                        <div className="row mt-4">
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded-3 shadow-sm">
                                    <p className="mb-2"><strong>Email:</strong> {displayUser.email}</p>
                                    <p className="mb-2"><strong>Role:</strong> <span className="badge bg-success">{displayUser.role}</span></p>
                                    <p className="mb-0"><strong>User ID:</strong> #{displayUser.id}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-muted italic">You can now navigate to "All Courses" to start registering for your classes.</p>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-warning">
                        No user data found. Please <button className="btn btn-link p-0" onClick={logout}>login again</button>.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;