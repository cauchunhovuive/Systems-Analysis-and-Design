import { useAuth } from '../AuthProvider';
import { useQuery } from "@tanstack/react-query";
import CourseComponent from '../components/CourseComponent';
import { apiClient } from '../config/api';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Courses = () => {
	const { isAuthenticated, isAuthReady } = useAuth();
	const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');

    useEffect(() => {
        if (isAuthReady && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthReady, isAuthenticated, navigate]);

	const getCourses = async () => {
		const result = await apiClient.get('/courses');
		return result.data;
	}

	const { data: courses, isLoading, isError } = useQuery({
		queryKey: ['courses'],
		queryFn: getCourses,
		staleTime: 15 * 60 * 1000,
		enabled: isAuthenticated,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false
	});

	if (isLoading) return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
    );
	if (isError) return <div className="p-5 text-center text-danger fw-bold mt-5">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>;

    const semesters = [...new Set(courses?.map(c => c.semester).filter(Boolean))].sort();
    const filteredCourses = courses?.filter(c => {
        const matchesSearch = c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) || c.course_code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSemester = semesterFilter ? c.semester === semesterFilter : true;
        return matchesSearch && matchesSemester;
    });

	return (
		<div className="container py-5" style={{marginTop: '60px', maxWidth: '1000px', fontFamily: "'Inter', sans-serif"}}>
			
            {/* Header & Search */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 border-bottom pb-4">
				<div>
                    <h3 className="fw-bold text-primary mb-1">Đăng ký học phần</h3>
                    <p className="text-secondary mb-0 small">Học kỳ: {semesterFilter || semesters[0] || 'Tất cả'}</p>
                </div>
			
                <div className='mt-3 mt-md-0 d-flex flex-column gap-3' style={{width: '100%', maxWidth: '450px'}}>
                    <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                        <span className="input-group-text bg-white border-0 text-muted ps-3">
                            <i className="bi bi-search"></i>
                        </span>
                        <input 
                            className="form-control border-0 shadow-none bg-white py-2" 
                            type="search" 
                            placeholder="Tìm mã hoặc tên môn học..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white">
                        <select 
                            className="form-select border-0 shadow-none py-2" 
                            value={semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value)}
                        >
                            <option value="">Tất cả học kỳ</option>
                            {semesters.map((semester) => (
                                <option key={semester} value={semester}>{semester}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content */}
			<div className="row g-4">
				{filteredCourses && filteredCourses.length > 0 ? filteredCourses.map((course) => (
                    <div className="col-12" key={course.id}>
                        <CourseComponent course={course} />
                    </div>
				)) : (
                    <div className="text-center py-5 text-muted bg-light rounded-4 border">
                        <i className="bi bi-search fs-1 d-block mb-3 text-secondary"></i>
                        <p className="fw-semibold">Không tìm thấy môn học nào phù hợp.</p>
                    </div>
                )}
			</div>
		</div>
	);
};

export default Courses;