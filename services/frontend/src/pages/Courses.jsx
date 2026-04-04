import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../AuthProvider';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import CourseComponent from '../components/CourseComponent';

const Courses = () => {
	const { isAuthenticated } = useAuth();
	const getCourses = async () => {
		const token = localStorage.getItem("token");
		const result = await axios.get('http://localhost:3000/api/courses', {
			headers: {
				'authorization': "Bearer " + token
			}
		});
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

	if (isLoading) return <div className="p-5">Loading user data...</div>;
	if (isError) return <div className="p-5">Error fetching user data. Please try again.</div>;

	return (
		<div className="position-absolute dashboard-page w-100 p-5">
			<div className="d-flex flex-row justify-content-between mb-5">
				<h2 className="fw-bold dashboard">Courses</h2>
				<div className='d-flex flex-row align-items-center rounded-5 search-bar p-2 w-50'>
					<input className="form-control border-0 rounded-5 me-2" type="search" placeholder="Search courses" />
					<FontAwesomeIcon icon={faMagnifyingGlass} />
				</div>
			</div>
			<div>
				{courses ? courses.map((course, index) => {
					return (
						<>
							<CourseComponent course={course} key={index} />
							{index < courses.length - 1
							? <hr />
							: <></>}
						</>
					);
				}) : <></>}
			</div>
		</div>
	);
};

export default Courses;