import React from 'react';

import { useAuth } from '@/contexts/AuthContext';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';


const passwordChangeFormSchema = z.object({
  newPassword: z.string().min(8, { 
    message: "Password must be at least 8 characters" 
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
  newPasswordConfirm: z.string().min(8, { 
    message: "Password must be at least 8 characters" 
  })
}).refine((data) => data.newPassword === data.newPasswordConfirm, {
  message: "Passwords don't match",
  path: ["newPasswordConfirm"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeFormSchema>;

interface UserPasswordChangeFormProps {
  onSuccess?: () => void;
  currentPassword: string;
  className?: string;
}

const UserPasswordChangeForm: React.FC<UserPasswordChangeFormProps> = ({ 
  onSuccess, 
  currentPassword,
  className 
}) => {
  const { passwordChange } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeFormSchema),
    defaultValues: {
      newPassword: "",
      newPasswordConfirm: "",
    },
  });

  const onSubmit = async (data: PasswordChangeFormValues) => {
    setError(null);
    setLoading(true);
    try {
      await passwordChange(currentPassword, data.newPassword, data.newPasswordConfirm);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Error changing password');
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
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} type="password"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPasswordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full rounded-md" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
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

export default UserPasswordChangeForm;
