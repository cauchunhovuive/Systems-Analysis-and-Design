import Auth from "./pages/Auth";
import Course from "./pages/Course";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import Enrollments from "./pages/Enrollments";

const routes = [
	{ path: "/login", page: Auth },
	{ path: "/", page: Dashboard },
	{ path: "/courses", page: Courses },
	{ path: "/courses/:id", page: Course },
	{ path: "/enrollments", page: Enrollments }
];

export { routes };