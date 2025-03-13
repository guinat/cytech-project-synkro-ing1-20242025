import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Redirects authenticated users away from auth pages.
const AuthRedirect: React.FC<AuthRedirectProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination from location state, or use the specified redirectTo
  const from = location.state?.from?.pathname || redirectTo;
  
  // Show loading state if auth is still being checked
  if (isLoading) {
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
  
  // If authenticated, redirect to the dashboard or the page they were trying to access
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  // Not authenticated, show the children (login/register page)
  return <>{children}</>;
};

export default AuthRedirect; 