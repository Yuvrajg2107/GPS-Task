import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    // 1. Not Logged In -> Go to Login Page
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 2. Role Not Allowed -> Redirect to their own dashboard
    if (!allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 3. Allowed -> Render the page
    return children;
};

export default ProtectedRoute;