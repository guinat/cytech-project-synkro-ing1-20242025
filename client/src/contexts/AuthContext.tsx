import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, 
         removeToken,
         login as loginService, 
         register as registerService, 
         emailVerify as emailVerifyService, 
         emailResend as emailResendService, 
         passwordResetRequest as passwordResetRequestService, 
         passwordResetConfirm as passwordResetConfirmService, 
         passwordChange as passwordChangeService, 
         } 
         from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: () => boolean;
  register: (email: string, password: string, username?: string, password_confirm?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  emailVerify: (token: string) => Promise<void>;
  emailResend: () => Promise<void>;
  passwordResetRequest: (email: string) => Promise<void>;
  passwordResetConfirm: (token: string, password: string, passwordConfirm: string) => Promise<void>;
  passwordChange: (current_password: string, new_password: string, new_password_confirm: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = window.location ? window.location : { pathname: '' };
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../services/auth.service').then(({ getToken }) => {
      const token = getToken();
      if (token) {
        import('../services/api').then(({ apiFetch }) => {
          apiFetch<any>('/me/')
            .then((res) => {
              setUser(res.data ?? res);
            })
            .catch(() => {
              setUser(null);
            })
            .finally(() => {
              setLoading(false);
            });
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });
  }, []);

  const isAuthenticated = () => {
    return !!user;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await loginService(email, password);
      setUser(user);
      // Vérification email : si non vérifié, redirige vers notice
      if (user && user.is_email_verified === false) {
        navigate('/auth/verify_email_notice', { replace: true });
        return;
      }
      // DEBUG: Affiche l'URL courante et la valeur de 'next'
      const searchParams = new URLSearchParams(window.location.search);
      const nextParam = searchParams.get('next');
      console.log('[AuthContext] login: window.location.search =', window.location.search);
      console.log('[AuthContext] login: nextParam =', nextParam);
      // Si un paramètre 'next' est présent dans l'URL, ne fait aucune redirection ici
      if (nextParam) {
        console.log('[AuthContext] login: next param detected, no redirection done in provider');
        return;
      }
      // Si on est sur la page d'acceptation d'invitation, ne pas rediriger
      if (location.pathname && location.pathname.startsWith('/invitations/accept/')) {
        console.log('[AuthContext] login: on /invitations/accept/, no redirection');
        return;
      }
      // (Pas de navigate ici)
      console.log('[AuthContext] login: no next param, no invitation, no redirection (navigate removed)');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username?: string, password_confirm?: string) => {
    setLoading(true);
    try {
      const user = await registerService(email, password, username, password_confirm);
      setUser(user);
      // Si on est sur la page d'acceptation d'invitation, ne pas rediriger
      if (location.pathname && location.pathname.startsWith('/invitations/accept/')) {
        return;
      }
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    // Si on est sur la page d'acceptation d'invitation, ne pas rediriger
    if (location.pathname && location.pathname.startsWith('/invitations/accept/')) {
      return;
    }
    // Redirige vers l'accueil sinon
    navigate('/');
  };

  const emailVerify = async (token: string) => {
    setLoading(true);
    try {
      await emailVerifyService(token);
      setUser(null);
      // Si on est sur la page d'acceptation d'invitation, ne pas rediriger
      if (location.pathname && location.pathname.startsWith('/invitations/accept/')) {
        return;
      }
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const emailResend = async () => {
    setLoading(true);
    try {
      await emailResendService();
    } finally {
      setLoading(false);
    }
  };

  const passwordResetRequest = async (email: string) => {
    setLoading(true);
    try {
      await passwordResetRequestService(email);
    } finally {
      setLoading(false);
    }
  };

  const passwordResetConfirm = async (token: string, password: string, passwordConfirm: string) => {
    setLoading(true);
    try {
      await passwordResetConfirmService(token, password, passwordConfirm);
      navigate('/auth/sign_in');
    } finally {
      setLoading(false);
    }
  };

  const passwordChange = async (current_password: string, new_password: string, new_password_confirm: string) => {
    setLoading(true);
    try {
      await passwordChangeService(current_password, new_password, new_password_confirm);
      navigate('/auth/logout');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };



  return (
    <AuthContext.Provider value={{ user, loading, login, isAuthenticated, register, logout, emailVerify, emailResend, passwordResetRequest, passwordResetConfirm, passwordChange }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
