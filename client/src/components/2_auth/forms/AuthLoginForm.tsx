import React from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

const authLoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { 
    message: "Password must be at least 8 characters" 
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
});

type AuthLoginFormValues = z.infer<typeof authLoginFormSchema>;

const AuthLoginForm: React.FC = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const form = useForm<AuthLoginFormValues>({
    resolver: zodResolver(authLoginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next');
    if (next) {
      sessionStorage.setItem('next_path', next);
    }
  }, [location.search]);

  const searchParams = new URLSearchParams(location.search);
  const next = searchParams.get('next');
  if (user && next) {
    return <Navigate to={next} replace />;
  }

  const onSubmit = async (data: AuthLoginFormValues) => {
    await login(data.email, data.password);
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                    <Button 
                      variant="link" 
                      className="px-0 font-normal" 
                      size="sm" 
                      asChild
                    >
                      <Link to="/auth/password-reset-request">Forgot password?</Link>
                    </Button>
                  </div>
                  <FormControl>
                    <Input placeholder="••••••••" {...field} type="password"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full rounded-md">
              Sign in
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account? <Link to="/auth/sign_up" className="text-blue-500 hover:text-blue-700 underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthLoginForm;

