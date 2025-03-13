import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';
import { toast } from 'sonner';
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/dashboard');
    toast.success("Login successful!");
  };

  const handleError = (error: string) => {
      toast.error(error);
  };
  
  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="h1-title">
            Welcome back
          </h1>
          <p className="mt-2 paragraph-small">
            Enter your credentials to sign in to your account
          </p>
        </div>
          <LoginForm onSuccess={handleSuccess} onError={handleError}/>
      </div>
    </MaxWidthWrapper>
  );
};

export default LoginPage;
