import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getMeService, updateMeService, deleteMeService, listUsersService, getUserService, createUserService, updateUserService, deleteUserService, UserProfile } from '@/services/user.service';
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
  getMeContext: () => Promise<UserProfile>;
  updateMeContext: (data: Partial<UserProfile> & { current_password: string; new_password?: string; new_password_confirm?: string; otp_code?: string; }) => Promise<any>;
  deleteMeContext: () => Promise<void>;
  listUsersContext: (params?: any) => Promise<UserProfile[]>;
  getUserContext: (id: string) => Promise<UserProfile>;
  createUserContext: (data: Partial<UserProfile>) => Promise<UserProfile>;
  updateUserContext: (id: string, data: Partial<UserProfile>) => Promise<UserProfile>;
  deleteUserContext: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const me = await getMeService();
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
      const res = await updateMeService(data);
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
      await deleteMeService();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []); 

  const getMeContext = async () => {
    setLoading(true);
    try {
      return await getMeService();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMeContext = async (data: Partial<UserProfile> & { current_password: string; new_password?: string; new_password_confirm?: string; otp_code?: string; }) => {
    setLoading(true);
    try {
      return await updateMeService(data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMeContext = async () => {
    setLoading(true);
    try {
      return await deleteMeService();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const listUsersContext = async (params?: any) => {
    setLoading(true);
    try {
      return await listUsersService(params);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserContext = async (id: string) => {
    setLoading(true);
    try {
      return await getUserService(id);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createUserContext = async (data: Partial<UserProfile>) => {
    setLoading(true);
    try {
      return await createUserService(data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserContext = async (id: string, data: Partial<UserProfile>) => {
    setLoading(true);
    try {
      return await updateUserService(id, data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUserContext = async (id: string) => {
    setLoading(true);
    try {
      return await deleteUserService(id);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{
      profile,
      loading,
      getProfile,
      updateProfile,
      deleteProfile,
      getMeContext,
      updateMeContext,
      deleteMeContext,
      listUsersContext,
      getUserContext,
      createUserContext,
      updateUserContext,
      deleteUserContext,
    }}>
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
