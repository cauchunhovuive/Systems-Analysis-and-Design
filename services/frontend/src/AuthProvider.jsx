import axios from 'axios';
import { useState, useEffect, createContext, useContext } from 'react';
import { API_BASE_URL } from './config/api'; // Lưu ý: ở đây là ./config/api

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setIsAuthenticated(true);
            setUser(JSON.parse(savedUser));
        }
        setIsAuthReady(true);
    }, []);

    const handleLogIn = async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setIsAuthenticated(true);
            setUser(userData);
            window.location.href = '/dashboard';
        } catch (err) {
            alert(err.response?.data?.message || "Đăng nhập thất bại");
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAuthReady, user, handleLogIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);