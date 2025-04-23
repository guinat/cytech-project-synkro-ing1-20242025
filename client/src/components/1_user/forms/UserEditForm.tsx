import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { setGlobalOtpCurrentPassword, getGlobalOtpCurrentPassword, clearGlobalOtpCurrentPassword } from '@/services/user.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

interface UserEditFormProps {
  onSuccess?: () => void;
  otpStep: boolean;
  setOtpStep: React.Dispatch<React.SetStateAction<boolean>>;
  otpCode: string;
  setOtpCode: React.Dispatch<React.SetStateAction<string>>;
}

const userEditSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Please provide a valid email' }),
  current_password: z.string().min(1, { message: 'Current password required' }),
  new_password: z.string().optional(),
  new_password_confirm: z.string().optional(),
}).refine((data) => {
  if (data.new_password || data.new_password_confirm) {
    return data.new_password === data.new_password_confirm;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['new_password_confirm'],
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

const UserEditForm: React.FC<UserEditFormProps> = ({ onSuccess, otpStep, setOtpStep, otpCode, setOtpCode }) => {
  const { profile, updateProfile, getProfile } = useUser();
  const otpCurrentPasswordRef = useRef<string>('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      username: profile?.username || '',
      email: profile?.email || '',
      current_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  });

  useEffect(() => {
    form.reset({
      username: profile?.username || '',
      email: profile?.email || '',
      current_password: '',
      new_password: '',
      new_password_confirm: '',
    });
  }, [profile]);

  const isDirty = form.formState.isDirty;

  const handleSubmitAll = async (data: UserEditFormValues) => {
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        current_password: data.current_password,
      };
      if (data.username && data.username !== (profile?.username || '')) payload.username = data.username;
      if (data.email && data.email !== (profile?.email || '')) payload.email = data.email;
      if (showPasswordForm && data.new_password && data.new_password_confirm) {
        payload.new_password = data.new_password;
        payload.new_password_confirm = data.new_password_confirm;
      }
      const res: any = await updateProfile(payload);
      const otpRequired = res?.otp_required || res?.data?.otp_required;
      if (otpRequired) {
        setGlobalOtpCurrentPassword(data.current_password);
        setOtpStep(true);
        setOtpCode('');
        setError('');
        setLoading(false);
        return;
      } else {
        await getProfile();
        toast.success(res?.message || 'Profile updated');
        form.reset({
          username: data.username,
          email: data.email,
          current_password: '',
          new_password: '',
          new_password_confirm: '',
        });
        otpCurrentPasswordRef.current = '';
        setShowPasswordForm(false);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      if (err?.errors) {
        setError(Object.values(err.errors).join(' | ') || err.message || 'Unknown error');
      } else {
        setError(err?.message || 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpValidate = async () => {
    setLoading(true);
    setOtpError('');
    try {
      const otpPwd = getGlobalOtpCurrentPassword();
      clearGlobalOtpCurrentPassword();
      const values = form.getValues();
      await updateProfile({
        ...values,
        current_password: otpPwd,
        otp_code: otpCode,
      });
      await getProfile();
      setOtpStep(false);
      setOtpCode('');
      otpCurrentPasswordRef.current = '';
      form.reset({
        username: values.username,
        email: values.email,
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      });
      setShowPasswordForm(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setOtpError(err?.message || 'Error validating OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOtp = () => {
    setOtpStep(false);
    setOtpCode('');
    setOtpError('');
    setError('');
    otpCurrentPasswordRef.current = '';
    form.reset({
      username: profile?.username || '',
      email: profile?.email || '',
      current_password: '',
      new_password: '',
      new_password_confirm: '',
    });
  };

  return (
    <div>
      <Card>
        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitAll)} className="space-y-4">
              {error && <p className="text-destructive text-sm">{error}</p>}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="username" />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} type="password" autoComplete="current-password" required />
                    </FormControl>
                    <FormDescription>Required for all changes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!showPasswordForm && (
                <Button type="button" variant="outline" className="w-full" onClick={() => setShowPasswordForm(true)}>Change password</Button>
              )}
              {showPasswordForm && (
                <div className="space-y-2 bg-muted p-4 rounded-md">
                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="new_password_confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm new password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setShowPasswordForm(false)}>Cancel password change</Button>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading || !form.watch('current_password') || (!isDirty && !showPasswordForm) || otpStep}
                className="w-full rounded-md"
              >
                Save
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Dialog open={otpStep} onOpenChange={open => { if (!open) handleCancelOtp(); }}>
        <DialogContent onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Email verification</DialogTitle>
            <DialogDescription>
              A verification code has been sent to your old email address. Please enter it below to validate the change.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleOtpValidate(); }} className="flex flex-col items-center gap-4 py-2">
            <InputOTP
              maxLength={6}
              value={otpCode || ''}
              onChange={val => setOtpCode(val || '')}
              disabled={loading}
              className="mx-auto"
            >
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {otpError && <p className="text-destructive text-sm text-center">{otpError}</p>}
            <div className="flex flex-row gap-4 w-full mt-2">
              <Button variant="outline" type="button" onClick={handleCancelOtp} disabled={loading} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={loading || otpCode.length !== 6} className="flex-1">Validate code</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserEditForm;