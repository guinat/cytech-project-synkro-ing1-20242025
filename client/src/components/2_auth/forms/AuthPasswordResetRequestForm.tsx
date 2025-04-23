import React from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

// Password reset request form schema with client-side validation
const authPasswordResetRequestFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

// Type for password reset request form values
type AuthPasswordResetRequestFormValues = z.infer<typeof authPasswordResetRequestFormSchema>;

interface AuthPasswordResetRequestFormProps {
  className?: string;
}

const AuthPasswordResetRequestForm: React.FC<AuthPasswordResetRequestFormProps> = ({ className }) => {
  const { passwordResetRequest } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Initialize form with react-hook-form
  const form = useForm<AuthPasswordResetRequestFormValues>({
    resolver: zodResolver(authPasswordResetRequestFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: AuthPasswordResetRequestFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await passwordResetRequest(data.email);
      setSuccess(true);
      form.reset();
    } catch (err: any) {
      setError(err?.message || 'Error sending reset link');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className || ''}`}>
        {error && <p className="text-destructive text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Reset link sent! Please check your email.</p>}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full rounded-md" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </Form>
  );

  // If className is provided, assume custom container and return form only
  if (className) {
    return formContent;
  }

  // Default view with Card wrapper
  return (
    <Card>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};

export default AuthPasswordResetRequestForm;
