import React from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';


// Registration form schema with client-side validation
const authRegisterFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
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

// Type for registration form values
type AuthRegisterFormValues = z.infer<typeof authRegisterFormSchema>;


const AuthRegisterForm: React.FC = () => {

  const { register } = useAuth();

  // Initialize form with react-hook-form
  const form = useForm<AuthRegisterFormValues>({
    resolver: zodResolver(authRegisterFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: AuthRegisterFormValues) => {
    await register(data.email, data.password, data.username, data.confirmPassword);
  };
  
  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input id="username" placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input id="email" placeholder="name@example.com" {...field} type="email" />
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
                  <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input id="password" placeholder="••••••••" {...field} type="password" />
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
                    <Input id="confirmPassword" placeholder="••••••••" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full rounded-md">
              Sign up
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground text-center">
          Already have an account? <Link to="/auth/sign_in" className="text-blue-500 hover:text-blue-700 underline">Log in</Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthRegisterForm;
