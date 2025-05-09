import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Header from '@/components/common/Header';
import NotFoundPage from '@/pages/NotFoundPage';
import LandingPage from '@/pages/LandingPage';
import DiscoverPage from '@/pages/DiscoverPage';

import AcceptInvitationPage from '@/pages/dashboard/AcceptInvitationPage';


import { AuthProvider } from '@/contexts/AuthContext.tsx';
import { HomesProvider, useHomes } from '@/contexts/HomesContext';
import { RoomsProvider } from '@/contexts/RoomsContext';

const DashboardWithRoomsProvider = ({ children }: { children: React.ReactNode }) => {
  const { homes, loading } = useHomes();
  
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-medium mb-4">Chargement de vos maisons...</h2>
      </div>
    );
  }

  if (homes.length === 0) {
    return <>{children}</>;
  }
  
  const selectedHome = homes[0];
  
  return (
    <RoomsProvider homeId={selectedHome.id}>
      {children}
    </RoomsProvider>
  );
};

import RegisterPage from '@/pages/2_auth/RegisterPage';
import LoginPage from '@/pages/2_auth/LoginPage';
import LogoutPage from '@/pages/2_auth/LogoutPage';
import VerifyEmailPage from '@/pages/2_auth/VerifyEmailPage';
import PasswordResetRequestPage from '@/pages/2_auth/PasswordResetRequestPage';
import PasswordResetPage from '@/pages/2_auth/PasswordResetPage';
import AuthRoute from '@/components/2_auth/AuthRedirect';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DevicesPage from '@/pages/dashboard/DevicesPage';
import GuestsPage from '@/pages/dashboard/GuestsPage';
import ProfilePage from '@/pages/dashboard/profile/ProfilePage';
import SettingsPage from '@/pages/dashboard/profile/SettingsPage';
import RequireEmailVerificationPage from '@/pages/dashboard/RequireEmailVerificationPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';

const ConditionalHeader: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  if (isDashboardRoute) {
    return null;
  }
  return <Header />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HomesProvider>
          <ConditionalHeader />
          <Routes>
            <Route path="/invitations/accept/:token" element={
              <AuthRoute requireAuth>
                <AcceptInvitationPage />
              </AuthRoute>
            } />
            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />

            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/discover" element={<DiscoverPage />} />

            {/* Auth routes */}
            <Route path="/auth/sign_in" element={<LoginPage />} />
          <Route path="/auth/sign_up" element={
            <AuthRoute redirectIfAuthenticated="/dashboard">
              <RegisterPage />
            </AuthRoute>
          } />
          <Route path="/auth/logout" element={<LogoutPage />} />
          <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/auth/password-reset-request" element={<PasswordResetRequestPage />} />
          <Route path="/auth/password-reset/:token" element={<PasswordResetPage />} />

          {/* Dashboard routes */}
          <Route path="/dashboard/verify-email-required" element={  
            <AuthRoute requireAuth>
              <RequireEmailVerificationPage />
            </AuthRoute>
          } />
          <Route element={
            <AuthRoute requireAuth requireEmailVerified redirectTo="/dashboard/verify-email-required">
              <DashboardWithRoomsProvider>
                <DashboardLayout />
              </DashboardWithRoomsProvider>
            </AuthRoute>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/devices" element={<DevicesPage />} />
<Route path="/dashboard/guests" element={<GuestsPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />

            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        </HomesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App