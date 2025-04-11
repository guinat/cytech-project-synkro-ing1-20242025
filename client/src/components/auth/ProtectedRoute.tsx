import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/auth.service';

/**
 * ProtectedRoute Component
 * 
 * This component protects routes that require authentication.
 * It also handles additional requirements such as email verification and profile completion.
 * 
 * Main features:
 * - Authentication verification
 * - Optional email verification (requireVerified)
 * - Optional profile completion verification (requireProfileCompleted)
 * - Retrieval of fresh user data from the server
 * - Intelligent handling of transient states (e.g., just after profile completion)
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
  requireProfileCompleted?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireVerified = false,
  requireProfileCompleted = true
}) => {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isVerifyingProfile, setIsVerifyingProfile] = useState(false);
  const [profileVerified, setProfileVerified] = useState(false);

  // Check if the user is coming from the profile completion page
  const isComingFromProfileCompletion = 
    location.state?.from?.pathname === '/complete-profile' || 
    sessionStorage.getItem('profile_just_completed') === 'true';

  // Verify profile from the server
  useEffect(() => {
    const verifyProfileCompletion = async () => {
      // Only verify if necessary and not already verifying
      if (!isAuthenticated || !requireProfileCompleted || isVerifyingProfile || profileVerified) {
        return;
      }

      try {
        setIsVerifyingProfile(true);
        
        // Retrieve fresh profile data
        const freshUserData = await authService.getProfile();
        
        // Update local state if data has changed
        if (JSON.stringify(freshUserData) !== JSON.stringify(user)) {
          updateUser(freshUserData);
        }
        
        setProfileVerified(true);
      } catch (error) {
        console.error('Error verifying profile:', error);
      } finally {
        setIsVerifyingProfile(false);
      }
    };
    
    verifyProfileCompletion();
  }, [isAuthenticated, requireProfileCompleted, user, updateUser, isVerifyingProfile, profileVerified]);

  // Handle the case where the user just completed their profile
  useEffect(() => {
    if (isComingFromProfileCompletion && user && user.is_profile_completed !== true) {
      // Force the is_profile_completed flag
      try {
        const updatedUser = {...user, is_profile_completed: true};
        localStorage.setItem('user_cache', JSON.stringify(updatedUser));
        updateUser(updatedUser);
        
        // Clear the session flag
        sessionStorage.removeItem('profile_just_completed');
      } catch (err) {
        console.error('Error updating cache:', err);
      }
    }
  }, [isComingFromProfileCompletion, user, updateUser]);

  // Display loading state
  if (isLoading || isVerifyingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-lg text-gray-600">
            {isVerifyingProfile ? "Verifying your profile..." : "Verifying authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // Security checks and redirections

  // 1. If the user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If email verification is required but not done, redirect to the verification page
  if (requireVerified && user && !user.email_verified) {
    return <Navigate to="/verify-email-required" state={{ from: location }} replace />;
  }

  // 3. Handle the special case where the user just completed their profile
  if (isComingFromProfileCompletion) {
    return <>{children}</>;
  }

  // 4. Check if the profile is complete when required
  if (requireProfileCompleted && user && user.is_profile_completed !== true && currentPath !== '/complete-profile') {
    // Check if all required fields are present despite the is_profile_completed flag
    const hasRequiredFields = 
      user.first_name && 
      user.last_name && 
      user.date_of_birth && 
      user.gender;

    // If the fields are present, consider the profile as completed
    if (hasRequiredFields) {
      try {
        const updatedUser = {...user, is_profile_completed: true};
        localStorage.setItem('user_cache', JSON.stringify(updatedUser));
        updateUser(updatedUser);
        return <>{children}</>;
      } catch (err) {
        console.error('Error during forced profile update:', err);
      }
    }
    
    // Otherwise, redirect to the profile completion page
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  // The user is authenticated and all conditions are met
  return <>{children}</>;
};

export default ProtectedRoute; 