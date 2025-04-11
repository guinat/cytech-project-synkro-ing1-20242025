import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster, toast } from 'sonner';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ProfileCompletionPage from '@/pages/auth/ProfileCompletionPage';
import LogoutPage from '@/pages/auth/LogoutPage';
import NotFoundPage from '@/pages/NotFoundPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import EmailChangePage from '@/pages/auth/EmailChangePage';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage';
import JoinHomePage from '@/pages/JoinHomePage';

// Protected Routes
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthRedirect from '@/components/auth/AuthRedirect';
import Header from './components/common/Header';
import DevicesPage from './pages/dashboard/DevicesPage';
import RoomsPage from './pages/dashboard/RoomsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import HomesPages from './pages/dashboard/HomesPages';

// Component to intercept global authentication errors
const AuthErrorHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to intercept unhandled API errors
    const handleUnauthorizedErrors = (event: ErrorEvent) => {
      if (event.error && event.error.name === 'ApiError' && event.error.status === 401) {
        console.log('Unhandled 401 error detected. Logging out and redirecting to login page.');
        logout();
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      }
    };

    // Add error event listener
    window.addEventListener('error', handleUnauthorizedErrors);

    return () => {
      window.removeEventListener('error', handleUnauthorizedErrors);
    };
  }, [logout, navigate]);

  return <>{children}</>;
};

// Component to conditionally display the Header
const ConditionalHeader: React.FC = () => {
  const location = useLocation();
  
  // Don't show header on dashboard routes, login/register or profile completion pages
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isProfilePage = location.pathname === '/profile';
  
  // Hide header completely on these pages
  if (isDashboardRoute || isProfilePage) {
    return null;
  }
  
  return <Header />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AuthErrorHandler>
          <ConditionalHeader />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
            <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
            <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            {/* Logout Route - Accessible to all authenticated users */}
            <Route path="/logout" element={<LogoutPage />} />
            
            {/* Profile Completion Route - Protected but no completed profile check */}
            <Route path="/complete-profile" element={
              <ProtectedRoute requireProfileCompleted={false}>
                <ProfileCompletionPage />
              </ProtectedRoute>
            } />
            
            {/* Email Change Route - Requires authentication */}
            <Route path="/auth/email-change" element={
              <ProtectedRoute requireProfileCompleted={true}>
                <EmailChangePage />
              </ProtectedRoute>
            } />
            
            {/* Email Verification Route - Accessible without authentication */}
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            
            {/* Invitation Route - To join a home via an invitation link */}
            <Route path="/join-home/:token" element={<JoinHomePage />} />
            
            {/* Dashboard routes */}
            <Route element={
              <ProtectedRoute requireProfileCompleted={true}>
                  <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/devices" element={<DevicesPage />} />
              <Route path="/dashboard/rooms" element={<RoomsPage />} />
              <Route path="/dashboard/homes" element={<HomesPages />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
            </Route>
            
            {/* Admin routes */}
            {/* TODO: Add admin routes */}
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthErrorHandler>
      </AuthProvider>
    </Router>
  );
}

export default App;