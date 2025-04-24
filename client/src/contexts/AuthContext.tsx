import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, 
         removeTokenService,
         loginService, 
         registerService, 
         emailVerifyService, 
         emailResendService, 
         passwordResetRequestService, 
         passwordResetConfirmService, 
         passwordChangeService, 
         } 
         from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string, password_confirm?: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../services/auth.service').then(({ getTokenService }) => {
      const token = getTokenService();
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

  const isAuthenticatedContext = () => {
    return !!user;
  };

  const loginContext = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await loginService(email, password);
      setUser(user);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const registerContext = async (email: string, password: string, username?: string, password_confirm?: string) => {
    setLoading(true);
    try {
      const user = await registerService(email, password, username, password_confirm);
      setUser(user);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logoutContext = () => {
    removeTokenService();
    setUser(null);
    navigate('/');
  };

  const emailVerifyContext = async (token: string) => {
    setLoading(true);
    try {
      await emailVerifyService(token);
      try {
        const { getMeService } = await import('@/services/user.service');
        const freshUser = await getMeService();
        setUser(freshUser);
        navigate('/dashboard');
      } catch (err) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const emailResendContext = async () => {
    setLoading(true);
    try {
      await emailResendService();
    } finally {
      setLoading(false);
    }
  };

  const passwordResetRequestContext = async (email: string) => {
    setLoading(true);
    try {
      await passwordResetRequestService(email);
    } finally {
      setLoading(false);
    }
  };

  const passwordResetConfirmContext = async (token: string, password: string, passwordConfirm: string) => {
    setLoading(true);
    try {
      await passwordResetConfirmService(token, password, passwordConfirm);
      navigate('/auth/sign_in');
    } finally {
      setLoading(false);
    }
  };

  const passwordChangeContext = async (current_password: string, new_password: string, new_password_confirm: string) => {
    setLoading(true);
    try {
      await passwordChangeService(current_password, new_password, new_password_confirm);
      navigate('/auth/sign_in');
    } finally {
      setLoading(false);
    }
  };



  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: isAuthenticatedContext,
      login: loginContext,
      register: registerContext,
      logout: logoutContext,
      emailVerify: emailVerifyContext,
      emailResend: emailResendContext,
      passwordResetRequest: passwordResetRequestContext,
      passwordResetConfirm: passwordResetConfirmContext,
      passwordChange: passwordChangeContext,
    }}>
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
