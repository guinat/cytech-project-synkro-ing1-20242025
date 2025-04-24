import React from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

const authPasswordResetRequestFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type AuthPasswordResetRequestFormValues = z.infer<typeof authPasswordResetRequestFormSchema>;

interface AuthPasswordResetRequestFormProps {
  className?: string;
}

const AuthPasswordResetRequestForm: React.FC<AuthPasswordResetRequestFormProps> = ({ className }) => {
  const { passwordResetRequest } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const form = useForm<AuthPasswordResetRequestFormValues>({
    resolver: zodResolver(authPasswordResetRequestFormSchema),
    defaultValues: {
      email: "",
    },
  });

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

export default AuthPasswordResetRequestForm;
