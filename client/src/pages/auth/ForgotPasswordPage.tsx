import React from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { toast } from 'sonner';
import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';
const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/login');
    toast.success('If the email address exists in our system, a password reset link will be sent.');
  };
  
  const handleError = (errorMessage: string) => {
    toast.error(errorMessage);
  };
  
  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <ForgotPasswordForm onSuccess={handleSuccess} onError={handleError} />
    </MaxWidthWrapper>
  );
};

export default ForgotPasswordPage; 