import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    if (!token) {
      navigate("/login");
    }
  }, []);

  const getUser = async () => {
    const token = localStorage.getItem("token");
    const result = await axios.get('http://localhost:3000/api/user', {
      headers: {
        'token': token
      }
    });
    return result.data.user;
  }

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    staleTime: 15 * 60 * 1000,
    enabled: isAuthenticated,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false
  });

  if (!user) return null;
  if (isLoading) return <div className="p-5">Loading user data...</div>;
  if (isError) return <div className="p-5">Error fetching user data. Please try again.</div>;

  return (
    <div className="position-absolute dashboard-page w-100 p-5">
      <div className="d-flex flex-row justify-content-between mb-3">
        <h2 className="fw-bold dashboard">Dashboard</h2>
        <h3>Welcome {user.role} {user.fullName}</h3>
      </div>
      <div className="line w-100 mb-5" />
      <div className="d-flex flex-column dashboard-buttons">
        <button
          className="btn button mb-5 fs-5 rounded-4"
          onClick={() => navigate("/courses")}
        >
          Register courses
        </button>
        <button
          className="btn button fs-5 rounded-4"
          onClick={() => navigate("/enrollments")}
        >
          Your registered courses
        </button>
      </div>
    </div>
  );
};

export default Dashboard;