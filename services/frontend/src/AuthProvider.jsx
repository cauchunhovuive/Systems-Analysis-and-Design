import axios from 'axios';
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthReady, setIsAuthReady] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		setIsAuthenticated(!!token);
		setIsAuthReady(true);
	}, []);

	const handleLogIn = (data) => {
		axios
			.post('http://localhost:3000/api/auth/login', data)
			.then((response) => {
				const token = response.data.token
				if (token) {
					localStorage.setItem("token", token);
					setIsAuthenticated(true);
					navigate(`/`);
				}
				else {
					alert("Login unsucessful");
				}
			})
			.catch((err) => {
				console.error(err);
				alert(err);
			})
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		setIsAuthenticated(false);
		navigate('/');
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, isAuthReady, handleLogIn, handleLogout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
}