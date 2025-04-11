import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCompletionForm from '@/components/forms/ProfileCompletionForm';
import { useAuth } from '@/context/AuthContext';
import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';

const ProfileCompletionPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect the user if they're not logged in or if their profile is already completed
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.is_profile_completed) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  if (isLoading) {
    return (
      <MaxWidthWrapper className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="mt-4 text-xl font-semibold">Loading...</h3>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="h1-title">Complete your profile</h1>
          <p className="mt-2 paragraph-small">
            We need some additional information to personalize your experience
          </p>
        </div>
        <ProfileCompletionForm />
      </div>
    </MaxWidthWrapper>
  );
};

export default ProfileCompletionPage;