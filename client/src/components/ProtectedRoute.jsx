import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    // 1. Wait for Auth Check to finish
    if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;

    // 2. Not Logged In? -> Go to Login Page
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 3. Logged In but Wrong Role? -> Go to THEIR Dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 4. Allowed -> Render the Page
    return children;
};

export default ProtectedRoute;