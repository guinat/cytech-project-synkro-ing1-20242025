import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeTokenService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  React.useEffect(() => {
    logout();
    removeTokenService();
    navigate('/');
  }, [logout, navigate]);

  return <div></div>;
};

export default Logout;
