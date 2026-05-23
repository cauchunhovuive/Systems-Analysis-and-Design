import Auth from "./pages/Auth";
import Course from "./pages/Course";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import Enrollments from "./pages/Enrollments";
import Register from "./pages/Register";
import Timetable from "./pages/Timetable";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Tuition from "./pages/Tuition";

const routes = [
	{ path: "/login", page: Auth },
	{ path: "/register", page: Register },
	{ path: "/", page: Dashboard },
	{ path: "/courses", page: Courses },
	{ path: "/courses/:id", page: Course },
	{ path: "/enrollments", page: Enrollments },
	{ path: "/timetable", page: Timetable },
	{ path: "/profile", page: Profile },
	{ path: "/admin", page: AdminDashboard },
	{ path: "/tuition", page: Tuition },

];

export { routes };