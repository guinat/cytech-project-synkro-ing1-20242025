import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getMe, updateMe, deleteMe, UserProfile } from '@/services/user.service';
import { useNavigate } from 'react-router-dom';

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  getProfile: () => Promise<void>;
  updateProfile: (data: {
    current_password: string;
    username?: string;
    email?: string;
    new_password?: string;
    new_password_confirm?: string;
    otp_code?: string;
  }) => Promise<any>;
  deleteProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const me = await getMe();
      setProfile(me);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const updateProfile = useCallback(async (data: {
    current_password: string;
    username?: string;
    email?: string;
    new_password?: string;
    new_password_confirm?: string;
    otp_code?: string;
  }) => {
    setLoading(true);
    try {
      if (!data.current_password) {
        throw new Error('Le mot de passe actuel est requis pour toute modification.');
      }
      const res = await updateMe(data);
      const otpRequired = res?.otp_required || res?.data?.otp_required;
      if (otpRequired) {
        return res;
      }
      if (res.data && res.data.email && profile?.email && res.data.email !== profile.email) {
        navigate('/auth/logout');
        return;
      }
      if (res.data && (res.data.id || res.data.email)) {
        setProfile(res.data);
      } else if (res.id || res.email) {
        setProfile(res);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, [profile, navigate]);

  const deleteProfile = useCallback(async () => {
    setLoading(true);
    try {
      await deleteMe();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []); 

  return (
    <UserContext.Provider value={{ profile, loading, getProfile, updateProfile, deleteProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
