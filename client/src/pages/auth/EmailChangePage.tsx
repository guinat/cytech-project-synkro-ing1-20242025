import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Validation schema definition
const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'The code must contain exactly 6 digits' })
    .regex(/^\d+$/, { message: 'The code must contain only digits' }),
});

type OtpFormValues = z.infer<typeof otpFormSchema>;

const EmailChangePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { confirmEmailChange, requestEmailChange } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [newEmail, setNewEmail] = useState<string>('');
  
  // Create form with react-hook-form
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    // Retrieve email from navigation state
    if (!isSuccess && location.state?.email && location.state?.password) {
      const email = location.state.email;
      const password = location.state.password;
      
      setNewEmail(email);
      
      // Automatically send email change request
      const sendRequest = async () => {
        try {
          await requestEmailChange(email, password);
          toast.success(`A verification code has been sent to your current email address`);
        } catch (error) {
          console.error('Error requesting email change:', error);
          toast.error("Error during email change request");
          navigate('/profile');
        }
      };
      
      sendRequest();
    } else if (!location.state?.email || !location.state?.password) {
      // If data is not available, redirect to profile
      toast.error("Missing email change data");
      navigate('/profile');
    }
  }, [location.state, navigate, requestEmailChange, isSuccess]);

  const onSubmit = async (values: OtpFormValues) => {
    setIsLoading(true);
    
    try {
      await confirmEmailChange(values.otp);
      setIsSuccess(true);
      toast.success("Your email address has been successfully changed");
      
      // Explicit redirection after a short delay to allow the user to see the message
      setTimeout(() => {
        navigate('/profile', { replace: true }); // Using 'replace' to replace the entry in history
      }, 1500);
    } catch (error) {
      console.error('Error confirming email change:', error);
      toast.error("The OTP code is invalid or has expired");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!location.state?.email || !location.state?.password) {
      toast.error("Missing email change data");
      return;
    }
    
    try {
      setIsLoading(true);
      await requestEmailChange(location.state.email, location.state.password);
      toast.success(`A new code has been sent to your current email address`);
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error("Error sending a new code");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Email Changed</CardTitle>
            <CardDescription className="text-center">
              Your email address has been successfully changed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 py-8">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-center text-muted-foreground">
              Your new email address <span className="font-medium">{newEmail}</span> is now associated with your account.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate('/profile')}
              className="w-full"
            >
              Back to profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/profile')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle>Confirm your new email address</CardTitle>
              <CardDescription>
                We have sent a verification code to your current email address
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Simplified alert to indicate where to find the code */}
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security verification</AlertTitle>
            <AlertDescription>
              A 6-digit verification code has been sent to your current email address.
              Please check your inbox and enter the code below.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        disabled={isLoading}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Please enter the 6-digit code we sent to your email address.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col space-y-3">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="w-full"
                >
                  Resend code
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailChangePage; 