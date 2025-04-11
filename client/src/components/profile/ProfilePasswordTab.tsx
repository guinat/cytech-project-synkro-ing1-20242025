import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Key } from "lucide-react";

// Definition of the validation schema for the password change form
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string()
    .min(8, { message: "New password must be at least 8 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }),
  confirmPassword: z.string().min(1, { message: "Please confirm your new password" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface ProfilePasswordTabProps {
  onSuccess?: () => void;
}

const ProfilePasswordTab: React.FC<ProfilePasswordTabProps> = ({ onSuccess }) => {
  const { changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialization of the form with react-hook-form
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await changePassword(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword
      );
      
      toast.success("Password changed successfully");
      
      // Reset the form
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Call the onSuccess callback function if it exists
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change your password</CardTitle>
        <CardDescription>
          Make sure to choose a strong and unique password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      {...field}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your new password"
                      {...field}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters long with at least one uppercase letter, one lowercase letter, and one number.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your new password"
                      {...field}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfilePasswordTab; 