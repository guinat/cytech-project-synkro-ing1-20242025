import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logout: React.FC = () => {
    const { logout } = useAuth();

    useEffect(() => {
        logout();
    }, [logout]);

    return <Navigate to="/login" replace />;
};

export default Logout;