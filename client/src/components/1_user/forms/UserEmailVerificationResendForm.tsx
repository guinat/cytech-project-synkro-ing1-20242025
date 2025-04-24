import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';

interface UserEmailVerificationResendFormProps {
  className?: string;
}

const UserEmailVerificationResendForm: React.FC<UserEmailVerificationResendFormProps> = ({ className }) => {
  const { emailResend } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm();

  const handleResend = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      await emailResend();
      setSuccess(true);
    } catch (e: any) {
      setError("Error sending verification link");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form className={`space-y-4 ${className || ''}`}>
        <Button 
          type="button" 
          onClick={handleResend} 
          disabled={loading}
          className="w-full rounded-md"
        >
          {loading ? 'Sending...' : 'Resend Verification Link'}
        </Button>
        {success && <p className="text-green-600 text-sm text-center">Link sent!</p>}
        {error && <p className="text-destructive text-sm text-center">{error}</p>}
      </form>
    </Form>
  );

  if (className) {
    return formContent;
  }

  return (
    <Card>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};

export default UserEmailVerificationResendForm;
