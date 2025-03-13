import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';
import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';
import { toast } from 'sonner';
const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set token in query parameters for the ResetPasswordForm to use
  useEffect(() => {
    // Only redirect if we have a token in the URL params and not already in query params
    const queryParams = new URLSearchParams(location.search);
    const queryToken = queryParams.get('token');
    
    if (token && !queryToken) {
      // Redirect to the same page but with token in query params instead of URL params
      navigate(`/reset-password?token=${token}`, { replace: true });
    }
  }, [token, navigate, location.search]);
  
  const handleSuccess = () => {
      navigate('/login');
      toast.success('Password reset successfully! Redirecting to login page...');
  };
  
  const handleError = (errorMessage: string) => {
    toast.error(errorMessage);
  };
  
  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      
          
          <ResetPasswordForm 
            onSuccess={handleSuccess}
            onError={handleError}
          />
      </MaxWidthWrapper>
  );
};

export default ResetPasswordPage; 