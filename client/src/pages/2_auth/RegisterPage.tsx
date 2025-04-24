import React from 'react';
import AuthRegisterForm from '@/components/2_auth/forms/AuthRegisterForm';
import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';
const RegisterPage: React.FC = () => {

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
          <AuthRegisterForm />
        </div>
    </MaxWidthWrapper>
  );
};

export default RegisterPage;