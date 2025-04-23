import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const EmailVerificationPage: React.FC = () => {
  const { emailVerify } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const verificationAttemptedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided in URL.');
      return;
    }

    const verifyEmailToken = async () => {
      if (verificationAttemptedRef.current) {
        return;
      }
      verificationAttemptedRef.current = true;
      
      try {
        await emailVerify(token);
        setStatus('success');
        setTimeout(() => navigate('/auth/sign_in'), 1200);
      } catch (err) {
        setStatus('error');
        if (err instanceof Error) {
          setErrorMessage(err.message);
        }
      }
    };
    
    verifyEmailToken();
  }, [location.search]);
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <CardHeader>
              <CardTitle>Verifying Your Email</CardTitle>
              <CardDescription>Please wait while we verify your email address</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-10">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </CardContent>
          </>
        );
      case 'success':
        return (
          <>
            <CardHeader>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>Your email has been successfully verified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertTitle>Verification Complete</AlertTitle>
                <AlertDescription>
                  Thank you for verifying your email address. You now have full access to your account.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full rounded-md"
              >
                Proceed to Login
              </Button>
            </CardFooter>
          </>
        );
      case 'error':
        return (
          <>
            <CardHeader>
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription>We couldn't verify your email address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || 'An error occurred during email verification. The link may be invalid or expired.'}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                onClick={() => navigate('/auth/sign_in')}
                className="w-full rounded-md"
              >
                Back to Login
              </Button>
              <Button 
                onClick={() => navigate('/auth/sign_up')} 
                className="w-full rounded-md"
              >
                Create New Account
              </Button>
            </CardFooter>
          </>
        );
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md mx-auto">
        {renderContent()}
      </Card>
    </div>
  );
};

export default EmailVerificationPage; 