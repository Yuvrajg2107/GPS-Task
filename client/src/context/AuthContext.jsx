import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired (exp is in seconds)
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded);
                }
            } catch (err) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (phone_number, password) => {
        try {
            const { data } = await API.post('/auth/login', { phone_number, password });
            localStorage.setItem('token', data.token);
            const decoded = jwtDecode(data.token);
            setUser(decoded);
            
            // Redirect based on role
            if (decoded.role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Login Failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;