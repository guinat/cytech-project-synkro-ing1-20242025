import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../common/Loading';

interface AuthRedirectProps {
  redirectIfAuthenticated?: string;
  requireAuth?: boolean;
  requireEmailVerified?: boolean;
  redirectTo?: string;
  children: React.ReactNode;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({
  redirectIfAuthenticated,
  requireAuth = false,
  requireEmailVerified = false,
  redirectTo = '/auth/sign_in',
  children
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  // Bloquer la redirection automatique sur /invitations/accept/:token

  if (loading) return <Loading />;

  // Si connecté et redirectIfAuthenticated défini, redirige vers 'next' si présent dans l'URL, sinon vers redirectIfAuthenticated
  // DEBUG

  if (
    user &&
    redirectIfAuthenticated &&
    !(
      location.pathname === '/auth/sign_in' &&
      new URLSearchParams(window.location.search).get('next')
    )
  ) {
    const searchParams = new URLSearchParams(window.location.search);
    let next = searchParams.get('next');
    if (!next) {
      next = sessionStorage.getItem('next_path');
    }
    if (next) {
      sessionStorage.removeItem('next_path');
      return <Navigate to={next} replace />;
    }
    return <Navigate to={redirectIfAuthenticated} replace />;
  }

  if (requireAuth && !user) {
    // Ajoute le paramètre next sauf si déjà sur la page de login
    const next = encodeURIComponent(location.pathname + location.search);
    if (!location.pathname.startsWith('/auth/sign_in')) {
      return <Navigate to={`/auth/sign_in?next=${next}`} replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  if (requireEmailVerified && !user?.is_email_verified) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AuthRedirect;
