import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
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


import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import AdminPage from '@/pages/admin/AdminPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
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
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Toaster richColors />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;