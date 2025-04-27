import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import UserEmailVerificationResendForm from '@/components/1_user/forms/UserEmailVerificationResendForm';

const RequireEmailVerificationPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="max-w-md w-full text-center">
        <CardTitle>Email Verification Required</CardTitle>
        <CardContent>
          <p className="mb-4">
            Verify your email address before accessing the dashboard.
            <br />
            Click on the link received by email, or request a new one below.
          </p>
          <UserEmailVerificationResendForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default RequireEmailVerificationPage;
