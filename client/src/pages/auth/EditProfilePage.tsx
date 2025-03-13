import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MaxWidthWrapper from '../../components/common/MaxWidthWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import EditProfileForm from '../../components/auth/EditProfileForm';
import { toast } from 'sonner';

const EditProfilePage: React.FC = () => {
  const { isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate('/dashboard');
    toast.success('Profile updated successfully');
  };
  
  const handleError = (errorMessage: string) => {
    toast.error(errorMessage);
  };
  
  if (isLoading) {
    return (
      <MaxWidthWrapper className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-lg text-gray-600">Loading your profile...</p>
          </div>
      </MaxWidthWrapper>
    );
  }
  
  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="h3-title">Update your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <EditProfileForm onSuccess={handleSuccess} onError={handleError} />
              </CardContent>
            </Card>
    </MaxWidthWrapper>
  );
};

export default EditProfilePage; 