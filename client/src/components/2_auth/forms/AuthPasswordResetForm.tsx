import React from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

const authPasswordResetFormSchema = z.object({
  password: z.string().min(8, { 
    message: "Password must be at least 8 characters" 
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthPasswordResetFormValues = z.infer<typeof authPasswordResetFormSchema>;

interface AuthPasswordResetFormProps {
  className?: string;
}

const AuthPasswordResetForm: React.FC<AuthPasswordResetFormProps> = ({ className }) => {
  const { passwordResetConfirm } = useAuth();
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<AuthPasswordResetFormValues>({
    resolver: zodResolver(authPasswordResetFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: AuthPasswordResetFormValues) => {
    if (!token) {
      toast.error("Token not found");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await passwordResetConfirm(token, data.password, data.confirmPassword);
      form.reset();
    } catch (err: any) {
      setError(err?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className || ''}`}>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} type="password"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} type="password"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full rounded-md" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
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

export default AuthPasswordResetForm;
