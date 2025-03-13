import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface EditProfileFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Profile form schema with client-side validation
const profileFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  new_email: z.string().email({ message: 'Please enter a valid email address' }),
  currentPassword: z.string().min(1, { message: 'Current password is required to make changes' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Schema for password change
const passwordChangeSchema = z.object({
  newPassword: z.string().min(8, { 
    message: "Password must be at least 8 characters" 
  }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
  confirmNewPassword: z.string().min(1, { message: 'Please confirm your password' })
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
});

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;


const EditProfileForm: React.FC<EditProfileFormProps> = ({ onSuccess, onError }) => {
  const { user, updateProfile, requestEmailChange, confirmEmailChange, changePassword } = useAuth();
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  
  // Initialize forms with react-hook-form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      new_email: '',
      currentPassword: '',
    },
  });

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      profileForm.setValue('username', user.username);
      profileForm.setValue('new_email', user.email);
    }
  }, [user, profileForm]);

  // Handle the main form submission
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    // Validate password form if password change is enabled 
    if (showPasswordFields) {
      const passwordResult = await passwordForm.trigger();
      if (!passwordResult) {
        if (onError) onError('Please fix the password errors before submitting');
        return;
      }
    }
    
    // Get password values if needed
    const passwordValues = passwordForm.getValues();
    
    // Check which fields changed
    const isUsernameChanged = values.username !== user.username;
    const isEmailChanged = values.new_email !== user.email;
    const isPasswordChanged = showPasswordFields && 
      passwordValues.newPassword && 
      passwordValues.confirmNewPassword && 
      passwordValues.newPassword === passwordValues.confirmNewPassword;
    
    // If nothing changed, don't proceed
    if (!isUsernameChanged && !isEmailChanged && !isPasswordChanged) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First verify current password before proceeding with any changes
      if (isEmailChanged) {
        try {
          // Request email change without opening the OTP dialog yet
          await requestEmailChange(values.new_email, values.currentPassword);
          // Only open OTP dialog after successful password verification
          setShowOtpDialog(true);
        } catch (err: any) {
          // Handle backend validation errors
          let errorMessage = 'Failed to request email change';
          if (err.name === 'ApiError') {
            errorMessage = err.message;
          }

          setIsLoading(false);
          if (onError) onError(errorMessage);
          return;
        }
      } else {
        // Apply username and/or password changes
        await applyChanges(
          isUsernameChanged ? true : false, 
          isPasswordChanged ? true : false, 
          values, 
          passwordValues
        );
      }
    } catch (err: any) {
      // Handle backend validation errors
      let errorMessage = 'Profile update failed';
      if (err.name === 'ApiError') {
        errorMessage = err.message;
      }
      
      if (onError) onError(errorMessage);
    } finally {
      if (!isEmailChanged) {
        setIsLoading(false);
      }
    }
  };
  
  // Apply the username and password changes
  const applyChanges = async (
    isUsernameChanged: boolean,
    isPasswordChanged: boolean, 
    values: ProfileFormValues,
    passwordValues: PasswordChangeValues
  ) => {
    try {
      // Apply username change if needed
      if (isUsernameChanged) {
        await updateProfile(values.username, values.currentPassword);
      }
      
      // Apply password change if needed
      if (isPasswordChanged) {
        await changePassword(
          values.currentPassword, 
          passwordValues.newPassword, 
          passwordValues.confirmNewPassword
        );
      }
      
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Handle backend validation errors
      let errorMessage = 'Profile update failed';
      if (err.name === 'ApiError') {
        errorMessage = err.message;
      }
      
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OTP verification for email change
  const handleOtpComplete = async (value: string) => {
    if (value.length !== 6) return;
    
    setIsLoading(true);
    
    try {
      await confirmEmailChange(value);
      
      // Check if there's also a username change
      const values = profileForm.getValues();
      const isUsernameChanged = user ? values.username !== user.username : false;
      const passwordValues = passwordForm.getValues();
      
      if (isUsernameChanged || showPasswordFields) {
        // Apply other changes if necessary
        await applyChanges(
          isUsernameChanged,
          showPasswordFields,
          values,
          passwordValues
        );
      }
          
      // Reset the form state
      setShowOtpDialog(false);
      setOtpValue('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Handle backend validation errors
      let errorMessage = 'Email verification failed';
      if (err.name === 'ApiError') {
        errorMessage = err.message;
      }
      
      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={profileForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Your username" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={profileForm.control}
          name="new_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="change-password" 
            checked={showPasswordFields}
            onCheckedChange={setShowPasswordFields}
            disabled={isLoading}
          />
          <Label htmlFor="change-password">Change Password</Label>
        </div>
        
        <Collapsible open={showPasswordFields}>
          <CollapsibleContent className="space-y-4">
            <div className="pl-6 border-l-2 border-indigo-100 space-y-4">
              <Form {...passwordForm}>
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <FormField
          control={profileForm.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4 flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => onSuccess && onSuccess()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="default" disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>

      {/* OTP Dialog for verification */}
      <Dialog open={showOtpDialog} onOpenChange={(open) => !open && setShowOtpDialog(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Verify Email Change
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert variant="default" className="mb-4">
              <AlertDescription>
                A verification code has been sent to your current email address. Please enter it below to confirm your email change.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} onComplete={handleOtpComplete}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowOtpDialog(false);
              setOtpValue('');
            }}>
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={isLoading || otpValue.length !== 6} 
              onClick={() => otpValue.length === 6 && handleOtpComplete(otpValue)}
            >
              {isLoading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
};

export default EditProfileForm; 