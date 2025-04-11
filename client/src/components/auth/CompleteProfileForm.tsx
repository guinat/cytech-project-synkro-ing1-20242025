import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { User } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AvatarUpload } from '@/components/auth/AvatarUpload';


interface CompleteProfileFormProps {
  onComplete?: () => void;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  profilePicture: File | null;
}

export const CompleteProfileForm: React.FC<CompleteProfileFormProps> = ({ onComplete }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    dateOfBirth: '',
    profilePicture: null,
  });

  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null);
  const [age, setAge] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateInput, setDateInput] = useState<string>('');

  // Calculate age whenever date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      try {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        
        // Adjust age if birthday hasn't occurred yet this year
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        
        setAge(calculatedAge);
      } catch (error) {
        setAge(null);
      }
    } else {
      setAge(null);
    }
  }, [formData.dateOfBirth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      // Handle date format DD/MM/YYYY
      const formatted = formatDateInput(value);
      setDateInput(formatted);
      
      // Convert from DD/MM/YYYY format to YYYY-MM-DD for internal storage
      if (formatted.length === 10) { // Complete DD/MM/YYYY format
        const [day, month, year] = formatted.split('/');
        const isoDate = `${year}-${month}-${day}`;
        
        // Check if the date is valid
        const date = new Date(isoDate);
        if (!isNaN(date.getTime())) {
          setFormData(prev => ({
            ...prev,
            dateOfBirth: isoDate
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Format date input to DD/MM/YYYY pattern
  const formatDateInput = (value: string): string => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Apply the mask
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 2);
    }
    if (digits.length > 2) {
      formatted += '/' + digits.substring(2, 4);
    }
    if (digits.length > 4) {
      formatted += '/' + digits.substring(4, 8);
    }
    
    return formatted;
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      profilePicture: file
    }));
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    
    // Clear error for profile picture
    if (errors.profilePicture) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.profilePicture;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      try {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        if (birthDate > today) {
          newErrors.dateOfBirth = 'Date of birth cannot be in the future';
        } else if (age && (age < 13 || age > 120)) {
          newErrors.dateOfBirth = 'Please enter a valid date of birth';
        }
      } catch (error) {
        newErrors.dateOfBirth = 'Invalid date format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast('Invalid form data', {
        description: 'Please check the form for errors',
      });
      return;
    }
    
    setLoading(true);
    console.log('CompleteProfileForm - Starting form submission', formData);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.firstName);
      formDataToSend.append('last_name', formData.lastName);
      formDataToSend.append('date_of_birth', formData.dateOfBirth);
      formDataToSend.append('is_profile_completed', 'true');
      
      if (formData.profilePicture) {
        formDataToSend.append('profile_picture', formData.profilePicture);
      }
      
      console.log('CompleteProfileForm - Sending data to server');
      
      const response = await api.put<User>('/users/profile/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('CompleteProfileForm - Server response:', {
        username: response.username,
        is_profile_completed: response.is_profile_completed
      });
      
      toast('Profile updated', {
        description: 'Your profile information has been saved',
      });
      
      // Refresh user data in the context
      console.log('CompleteProfileForm - Updating user data in context');
      await updateUser(response);
      
      // Call onComplete callback or navigate to dashboard
      if (onComplete) {
        console.log('CompleteProfileForm - Calling onComplete callback');
        onComplete();
      } else {
        console.log('CompleteProfileForm - Redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('CompleteProfileForm - Error updating profile:', error);
      toast('Update failed', {
        description: 'There was an error updating your profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Please provide some additional information to complete your profile setup.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-4">
            <AvatarUpload 
              previewUrl={previewUrl} 
              onChange={handleFileChange} 
              error={errors.profilePicture}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className={errors.firstName ? 'text-destructive' : ''}>
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className={errors.lastName ? 'text-destructive' : ''}>
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dateOfBirth" className={errors.dateOfBirth ? 'text-destructive' : ''}>
                Date of Birth
              </Label>
              {age !== null && (
                <span className="text-sm text-muted-foreground">Age: {age}</span>
              )}
            </div>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              value={dateInput}
              onChange={handleInputChange}
              placeholder="DD/MM/YYYY"
              className={errors.dateOfBirth ? 'border-destructive' : ''}
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">Format: DD/MM/YYYY (ex: 15/01/1990)</p>
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 