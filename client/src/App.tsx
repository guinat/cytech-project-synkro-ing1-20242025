import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { HomeProvider } from '@/context/HomeContext';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/common/Header';
// Auth components
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthRedirect from '@/components/auth/AuthRedirect';
import AdminRoute from '@/components/auth/AdminRoute';
// Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import EditProfilePage from '@/pages/auth/EditProfilePage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import HomePage from '@/pages/HomePage';
import AdminPage from '@/pages/admin/AdminPage';
import ControlCenterPage from '@/pages/ControlCenterPage';

// wrapper
const AppContent: React.FC = () => {
  const location = useLocation();

  const hiddenHeaderRoutes = ['/control-center'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hiddenHeaderRoutes.includes(location.pathname) && <Header />}
      <main className="flex-grow">
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
          <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />
          <Route path="/reset-password" element={<AuthRedirect><ResetPasswordPage /></AuthRedirect>} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/control-center" element={<ProtectedRoute><ControlCenterPage /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Toaster richColors />
    </div>
  );
};

// Dashboard
const App: React.FC = () => {
  return (
    <AuthProvider>
      <HomeProvider>
        <Router>
          <AppContent />
        </Router>
      </HomeProvider>
    </AuthProvider>
  );
};

export default App;