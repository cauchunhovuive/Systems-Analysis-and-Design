import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../AuthProvider';
import { useQuery } from "@tanstack/react-query";
import CourseComponent from '../components/CourseComponent';
import { apiClient } from '../config/api';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Enrollments = () => {
	const navigate = useNavigate();
	const { isAuthenticated, isAuthReady } = useAuth();
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		if (isAuthReady && !isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthReady, isAuthenticated, navigate]);

	const getEnrollments = async () => {
		const result = await apiClient.get('/enrollments');
		return result.data;
	}

	const { data: enrollments, isLoading, isError } = useQuery({
		queryKey: ['enrollments'],
		queryFn: getEnrollments,
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

	const filteredEnrollments = enrollments?.filter(e => 
		e.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
		e.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="container py-5" style={{marginTop: '60px', maxWidth: '1000px', fontFamily: "'Inter', sans-serif"}}>
			<div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3 border-bottom pb-4">
				<div>
                    <h3 className="fw-bold text-primary mb-1">Học phần đã đăng ký</h3>
                    <p className="text-secondary mb-0 small">Danh sách các môn học bạn đã đăng ký thành công hoặc đang chờ duyệt.</p>
                </div>
				<div className='input-group shadow-sm rounded-pill overflow-hidden border bg-white' style={{maxWidth: '400px'}}>
					<span className="input-group-text bg-white border-0 text-muted ps-3">
						<FontAwesomeIcon icon={faMagnifyingGlass} />
					</span>
					<input 
						className="form-control border-0 shadow-none bg-white py-2" 
						type="text" 
						placeholder="Tìm tên hoặc mã môn học..." 
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
                    {searchTerm && (
                        <button className="btn bg-white border-0 text-muted pe-3" onClick={() => setSearchTerm('')}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
				</div>
			</div>
			<div>
				{filteredEnrollments && filteredEnrollments.length > 0 ? (
					<div className="row g-4">
						{filteredEnrollments.map((enrollment, index) => (
							<div className="col-12" key={enrollment.id || index}>
								<CourseComponent course={enrollment} enrollment={true} />
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-5 text-muted bg-light rounded-4 border">
						<div className="mb-3">
                            <FontAwesomeIcon icon={faMagnifyingGlass} style={{fontSize: '3rem', opacity: 0.3}} />
                        </div>
						<p className="fw-semibold">Không tìm thấy học phần nào phù hợp với "{searchTerm}".</p>
                        <button className="btn btn-link text-decoration-none" onClick={() => setSearchTerm('')}>Xóa bộ lọc</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Enrollments;