import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from './config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthReady, setIsAuthReady] = useState(false);
	const [user, setUser] = useState(null); // Lưu thông tin user (bao gồm role)
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		const savedUser = localStorage.getItem('user');
		if (token && savedUser) {
			try {
				setUser(JSON.parse(savedUser));
				setIsAuthenticated(true);
			} catch {
				localStorage.removeItem('user');
			}

			apiClient.get('/user')
				.then((response) => {
					setUser(response.data.user);
					setIsAuthenticated(true);
					localStorage.setItem('user', JSON.stringify(response.data.user));
				})
				.catch(() => {
					localStorage.removeItem('token');
					localStorage.removeItem('user');
					setUser(null);
					setIsAuthenticated(false);
				})
				.finally(() => {
					setIsAuthReady(true);
				});
		} else {
			setIsAuthReady(true);
		}
	}, []);

	const handleLogIn = (data) => {
		apiClient
			.post('/auth/login', data)
			.then((response) => {
				const token = response.data.token;
				const userData = response.data.user;
				if (token) {
					localStorage.setItem("token", token);
					if (userData) {
						localStorage.setItem("user", JSON.stringify(userData));
						setUser(userData);
					}
					setIsAuthenticated(true);
					// Admin/Academic Office chuyển đến trang quản trị
					if (userData?.role === 'ADMIN' || userData?.role === 'ACADEMIC_OFFICE') {
						navigate('/admin');
					} else {
						navigate('/');
					}
				} else {
					alert("Đăng nhập không thành công");
				}
			})
			.catch((err) => {
				console.error(err);
				alert("Đăng nhập thất bại: " + (err.response?.data?.message || err.message));
			});
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		setIsAuthenticated(false);
		setUser(null);
		navigate('/login');
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, isAuthReady, user, handleLogIn, handleLogout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
}