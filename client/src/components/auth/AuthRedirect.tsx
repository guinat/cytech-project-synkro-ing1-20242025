import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/auth.service';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Redirects authenticated users away from auth pages.
const AuthRedirect: React.FC<AuthRedirectProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [tokenCheckComplete, setTokenCheckComplete] = useState(false);
  
  // Get the intended destination from location state, or use the specified redirectTo
  const from = location.state?.from?.pathname || redirectTo;
  
  // Determine where to redirect based on profile completion status
  const redirectDestination = user?.is_profile_completed === false 
    ? '/complete-profile' 
    : from;
  
  // Effect for independent token verification
  useEffect(() => {
    if (!tokenCheckComplete) {
      const hasToken = authService.isAuthenticated();
      const token = authService.getAccessToken();
      console.log("AuthRedirect - Independent token verification:", {
        hasToken,
        tokenLength: token?.length
      });
      setTokenCheckComplete(true);
    }
  }, [tokenCheckComplete]);
  
  // Debug logging
  useEffect(() => {
    console.log("AuthRedirect - Current state:", { 
      isAuthenticated, 
      isLoading,
      isProfileCompleted: user?.is_profile_completed,
      redirectDestination,
      originalDestination: from,
      location: location.pathname,
      shouldRedirect,
      tokenCheckComplete,
      hasToken: authService.isAuthenticated()
    });
    
    // If user is authenticated, prepare redirection with a small delay
    // to allow all states to update correctly
    if (isAuthenticated && !isLoading && !shouldRedirect) {
      console.log("AuthRedirect - Preparing redirection...");
      const timer = setTimeout(() => {
        // Double check before redirecting
        if (authService.isAuthenticated()) {
          console.log("AuthRedirect - Activating redirect to:", redirectDestination, 
            user?.is_profile_completed === false ? "(profile not completed)" : "");
          setShouldRedirect(true);
        } else {
          console.log("AuthRedirect - Redirection attempt canceled: invalid token");
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, from, location, shouldRedirect, user, redirectDestination]);

  // Show loading state if auth is still being checked
  if (isLoading) {
    console.log("AuthRedirect - Loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-lg text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // If user is authenticated and shouldRedirect is true, perform redirection
  if (isAuthenticated && shouldRedirect) {
    console.log("AuthRedirect - Redirecting to:", redirectDestination);
    return <Navigate to={redirectDestination} replace />;
  }
  
  // If user is authenticated but shouldRedirect is still false, show transition indicator
  if (isAuthenticated && !shouldRedirect) {
    console.log("AuthRedirect - Preparing redirection...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-lg text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated, show the children (login/register page)
  console.log("AuthRedirect - User not authenticated, displaying login form");
  return <>{children}</>;
};

export default AuthRedirect; 