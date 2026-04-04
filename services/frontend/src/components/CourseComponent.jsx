import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from "react";
import { Toast } from 'bootstrap';

const CourseComponent = ({ course, enrollment }) => {
	const navigate = useNavigate();
	const [showToast, setShowToast] = useState(false);
	const toastRef = useRef(null);

	useEffect(() => {
		if (showToast && toastRef.current) {
      const liveToast = new Toast(toastRef.current, { delay: 3000 });
      liveToast.show();
    }
	}, [showToast]);

	const getClass = () => {
		switch (course.status) {
			case "SUCCESS":
				return "fw-bold text-success mb-auto";
			case "PENDING":
				return "fw-bold text-warning mb-auto";
			case "FAILED":
				return "fw-bold text-danger mb-auto";
		}
	}

	const registerCourse = () => {
		const data = { courseId: course.id };
		axios
			.post('http://localhost:3000/api/enrollments', data, {
				headers: {
					'authorization': "Bearer " + localStorage.getItem("token")
				}
			})
			.then(() => setShowToast(true))
			.catch((err) => alert(err))
	};

	const unregisterCourse = () => {
		axios
			.delete(`http://localhost:3000/api/enrollments/${course.id}`, {
				headers: {
					'authorization': "Bearer " + localStorage.getItem("token")
				}
			})
			.then(() => setShowToast(true))
			.catch((err) => alert(err))
	};

	return (
		<div className="d-flex flex-row ms-auto me-auto course">
			<div>
				<h4 className="fw-bold">Course: {course.course_name} ({course.course_code})</h4>
				<h5>Lecturer: {course.lecturer_name}</h5>
				<h5>Time: {course.start_time} - {course.end_time}, {course.day_of_week}</h5>
				{enrollment
				?	<>
					<h5>Group: {course.group_code}</h5>
					<h5>Level: {course.level}</h5>
				</>
				: <></>}
			</div>
			<div className="d-flex flex-column align-items-center ms-auto">
				{enrollment
				? <h4 className={getClass()}>{course.status}</h4>
				: <button
					className="btn button mb-auto"
					onClick={() => navigate(`/courses/${course.id}`)}
				>
					?
				</button>}
				<button
					className="btn button"
					onClick={() => { enrollment ? unregisterCourse() : registerCourse(); }}
				>
					{enrollment ? "Unregister" : "Register"}
				</button>
			</div>
			{showToast && (
				<div className="toast position-absolute" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000" ref={toastRef}>
					<div className="toast-header">
						<FontAwesomeIcon icon={faSquare} className='square me-1' />
						<strong className="me-auto">CRS</strong>
						<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
					</div>
					<div className="toast-body">
						You've {enrollment ? "unregistered" : "registered"} {course.course_name} course!
					</div>
				</div>
			)}
		</div>
	);
};

export default CourseComponent;