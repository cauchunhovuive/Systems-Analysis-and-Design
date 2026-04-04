import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { useQuery } from "@tanstack/react-query";

const Course = () => {
	const { id } = useParams();
	const { isAuthenticated } = useAuth();

	const getCourse = async () => {
		const result = await axios.get(`http://localhost:3000/api/courses/${id}`, {
			headers: {
				'authorization': "Bearer " + localStorage.getItem("token")
			}
		});
		return result.data;
	}

	const { data: course, isLoading, isError } = useQuery({
		queryKey: ['course', id],
		queryFn: getCourse,
		staleTime: 15 * 60 * 1000,
		enabled: isAuthenticated,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false
	});

	if (!course) return null;
	if (isLoading) return <div className="p-5">Loading user data...</div>;
	if (isError) return <div className="p-5">Error fetching user data. Please try again.</div>;

	return (
		<div className="position-absolute dashboard-page w-100 p-5">
			<h2 className='fw-bold title mb-5'>Course: {course.course_name} ({course.course_code})</h2>
			<h4>Lecturer: {course.lecturer_name}</h4>
			<h4>Time: {course.start_time} - {course.end_time}, {course.day_of_week}</h4>
			<h4>Maximum Capacity: {course.capacity}</h4>
			<h4>Group: {course.group_code}</h4>
			<h4>Level: {course.level}</h4>
		</div>
	);
};

export default Course;