import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  React.useEffect(() => {
    logout();
    removeToken();
    navigate('/');
  }, [logout, navigate]);

  return <div></div>;
};

export default Logout;
