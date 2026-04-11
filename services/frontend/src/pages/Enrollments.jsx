import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast'; // Import toast

const Enrollments = () => {
    const [enrollments, setEnrollments] = useState([]);

    const fetchMyEnrollments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/enrollments/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setEnrollments(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchMyEnrollments();
        const interval = setInterval(fetchMyEnrollments, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCancel = async (courseId) => {
        if (!window.confirm("Drop this course?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/enrollments/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success("Course dropped successfully!"); // Dùng toast
            fetchMyEnrollments();
        } catch (err) {
            toast.error("Failed to drop course");
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold text-primary">My Schedule</h2>
            <div className="table-responsive shadow-sm rounded">
                <table className="table table-hover align-middle bg-white mb-0">
                    <thead className="table-light">
                        <tr><th>Course</th><th>Status</th><th className="text-center">Action</th></tr>
                    </thead>
                    <tbody>
                        {enrollments.map(item => (
                            <tr key={item.id}>
                                <td><div className="fw-bold">{item.course_name}</div><div className="small text-muted">{item.course_code}</div></td>
                                <td><span className={`badge rounded-pill ${item.status === 'SUCCESS' ? 'bg-success' : 'bg-warning text-dark'}`}>{item.status}</span></td>
                                <td className="text-center"><button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(item.course_id)}>Drop</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Enrollments;