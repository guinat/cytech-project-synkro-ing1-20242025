import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Effect to redirect if the user is already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("LoginPage - User already authenticated, redirecting to /dashboard");
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleSuccess = () => {
    console.log("LoginPage - Login successful, redirecting to /dashboard");
    // Add a small delay to ensure the authentication state is updated
    setTimeout(() => {
      navigate('/dashboard');
      toast.success("Login successful!");
    }, 100);
  };

  const handleError = (error: string) => {
    console.error("LoginPage - Login error:", error);
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
