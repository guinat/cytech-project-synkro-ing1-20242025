import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, User, Mail, Key, UploadCloud, PencilIcon, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import ProfilePasswordTab from '@/components/profile/ProfilePasswordTab';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';

// Definition of validation schema for profile form
const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  gender: z.enum(['male', 'female', 'other'], { 
    required_error: 'Please select a gender' 
  }),
  date_of_birth: z.date({
    required_error: 'Date of birth is required',
  }),
  home_role: z.string().optional(),
  current_password: z.string().min(1, { message: 'Current password is required to make changes' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateProfile, uploadAvatar, prepareProfileChanges, resendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSending, setIsVerificationSending] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  // Initialize form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      email: user?.email || '',
      gender: user?.gender || 'other',
      date_of_birth: user?.date_of_birth ? new Date(user.date_of_birth) : undefined,
      home_role: user?.home_role || '',
      current_password: '',
    },
  });

  // Form submission handler
  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Convert date to ISO format
      const formattedDate = values.date_of_birth ? format(values.date_of_birth, 'yyyy-MM-dd') : undefined;
      
      // Prepare data to update
      const updateData = {
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username,
        gender: values.gender,
        date_of_birth: formattedDate,
        home_role: values.home_role,
        current_password: values.current_password,
        email: values.email, // Add email for prepareProfileChanges
      };
      
      // If email has changed, open confirmation dialog
      if (values.email !== user?.email) {
        // Store all profile changes to apply after email confirmation
        prepareProfileChanges(updateData);
        
        setShowEmailChangeDialog(true);
        setIsLoading(false);
        return;
      }
      
      // Update profile
      await updateProfile(updateData);
      
      // Update avatar if needed
      if (avatar) {
        await uploadAvatar(avatar);
      }
      
      toast.success('Profile updated successfully');
      setIsEditMode(false); // Return to display mode after update
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send verification email
  const handleResendVerificationEmail = async () => {
    if (!user) return;
    
    setIsVerificationSending(true);
    try {
      await resendVerificationEmail();
      toast.success('A verification email has been sent to your email address');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsVerificationSending(false);
    }
  };

  // Avatar change handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image');
        return;
      }
      
      // Check size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be less than 2MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      setAvatar(file);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user) return 'U';
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` || user.username?.[0] || 'U';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>

      {!isEditMode ? (
        // Display Mode - Profile summary card
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </div>
            <Button 
              onClick={() => setIsEditMode(true)}
              className="flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage 
                    src={user.avatar_url || user.avatar} 
                    alt={user.username} 
                    className="object-cover" 
                  />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {user.email}
                    </p>
                    {user.email_verified ? (
                      <StatusBadge 
                        variant="success" 
                        position="inline" 
                        className="ml-2" 
                        text="Verified" 
                      />
                    ) : (
                      <div className="flex items-center">
                        <StatusBadge 
                          variant="warning" 
                          position="inline" 
                          className="ml-2" 
                          text="Not verified" 
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-xs h-7 px-2"
                          onClick={handleResendVerificationEmail}
                          disabled={isVerificationSending}
                        >
                          {isVerificationSending ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          Verify
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                  <p className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {user.date_of_birth && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date of birth</h3>
                    <p className="flex items-center mt-1">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(new Date(user.date_of_birth), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                )}
                
                {user.home_role && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Home role</h3>
                    <p className="flex items-center mt-1">
                      <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                      {user.home_role}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Level</h3>
                  <p className="mt-1 capitalize">{user.level}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Points</h3>
                  <p className="mt-1">{user.points}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Member since</h3>
                  <p className="mt-1">{format(new Date(user.date_joined), 'MM/yyyy')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Edit Mode - Profile editing card
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsEditMode(false)}
              className="h-8 w-8 rounded-full p-0 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <CardTitle>Edit your profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="profile">General information</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Profile picture */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative group mb-4">
                        <Avatar className="h-24 w-24">
                          {avatarPreview ? (
                            <AvatarImage src={avatarPreview} alt={user.username} className="object-cover" />
                          ) : (
                            <AvatarImage src={user.avatar_url || user.avatar} alt={user.username} className="object-cover" />
                          )}
                          <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <label htmlFor="avatar-upload" className="cursor-pointer p-2 text-white">
                            <UploadCloud className="h-8 w-8" />
                            <input 
                              id="avatar-upload" 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleAvatarChange}
                              disabled={isLoading}
                            />
                          </label>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Click on the image to change your profile picture</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
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
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              Email
                              {user.email_verified ? (
                                <span className="inline-flex items-center ml-2 text-xs font-medium text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center ml-2 text-xs font-medium text-amber-600">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Not verified
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                            <FormDescription className="flex items-center justify-between">
                              <span>Email changes will require verification.</span>
                              {!user.email_verified && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7 px-2 ml-2"
                                  onClick={handleResendVerificationEmail}
                                  disabled={isVerificationSending}
                                >
                                  {isVerificationSending ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                  )}
                                  Send verification email
                                </Button>
                              )}
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of birth</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isLoading}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd MMMM yyyy", { locale: fr })
                                    ) : (
                                      <span>Select a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  locale={fr}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="home_role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home role (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="For example: Parent, Child, Roommate..." {...field} disabled={isLoading} />
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
                          <FormLabel>Current password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your current password to confirm changes" 
                              {...field} 
                              disabled={isLoading} 
                            />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>
                            Your current password is required to change your information.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditMode(false)} 
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="password">
                <ProfilePasswordTab onSuccess={() => setIsEditMode(false)} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Email change dialog */}
      <Dialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change your email address</DialogTitle>
            <DialogDescription>
              For security reasons, changing your email address requires additional verification.
              We will send a verification code to your new email address.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              New email address: <span className="font-medium">{form.getValues().email}</span>
            </p>
            {/* Add notification about other modifications */}
            <p className="text-sm mb-2">
              Other changes to your profile will also be applied after your email is verified.
            </p>
            <p className="text-sm">
              After clicking "Continue", you will be guided through the verification process.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEmailChangeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Redirect to email change process
              setShowEmailChangeDialog(false);
              navigate('/auth/email-change', { 
                state: { 
                  email: form.getValues().email,
                  password: form.getValues().current_password
                } 
              });
            }}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage; 