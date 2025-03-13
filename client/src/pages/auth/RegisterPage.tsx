import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm';
import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';
import { toast } from 'sonner';
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/dashboard');
    toast.success("Account created successfully! Please verify your email.");
  };

  const handleError = (error: string) => {
    toast.error(error);
  };
  

  
  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="h1-title">
            Create an account
          </h1>
          <p className="mt-2 paragraph-small">
            Sign up to get started with Synkro
          </p>
        </div>
          <RegisterForm onSuccess={handleSuccess} onError={handleError}/>
        </div>
    </MaxWidthWrapper>
  );
};

export default RegisterPage;
