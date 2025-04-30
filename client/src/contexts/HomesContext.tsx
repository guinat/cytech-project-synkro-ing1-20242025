import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  listHomes as listHomesService,
  createHome as createHomeService,
  updateHome as updateHomeService,
  deleteHome as deleteHomeService,
  setPrimaryHome as setPrimaryHomeService,
  listInvitations as listInvitationsService,
  createInvitation as createInvitationService,
  acceptInvitation as acceptInvitationService,
  rejectInvitation as rejectInvitationService,
  acceptInvitationByToken as acceptInvitationByTokenService,
  rejectInvitationByToken as rejectInvitationByTokenService,
  getHome as getHomeService,
  removeMember as removeMemberService,
  Home,
  HomeInvitation
} from '@/services/homes.service';

interface HomesContextType {
  homes: Home[];
  loading: boolean;
  reloadHomes: () => Promise<void>;
  createHome: (payload: Partial<Home>) => Promise<Home>;
  updateHome: (id: string, payload: Partial<Home>) => Promise<Home>;
  deleteHome: (id: string) => Promise<void>;
  setPrimaryHome: (id: string) => Promise<Home>;
  listInvitations: (homeId: string) => Promise<HomeInvitation[]>;
  createInvitation: (homeId: string, email: string) => Promise<HomeInvitation>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  acceptInvitationByToken: (token: string) => Promise<void>;
  rejectInvitationByToken: (token: string) => Promise<void>;
  getHomeDetail: (id: string) => Promise<Home>;
  removeMember: (homeId: string, userId: string) => Promise<Home>;
}

const HomesContext = createContext<HomesContextType | undefined>(undefined);

export const HomesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadHomes = async () => {
    setLoading(true);
    try {
      const data = await listHomesService();
      setHomes(data);
    } catch (error: any) {
      setHomes([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      reloadHomes();
    }
  }, [user]);

  const createHomeContext = async (payload: Partial<Home>) => {
    setLoading(true);
    try {
      const home = await createHomeService(payload);
      await reloadHomes();
      return home;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateHomeContext = async (id: string, payload: Partial<Home>) => {
    setLoading(true);
    try {
      const home = await updateHomeService(id, payload);
      await reloadHomes();
      return home;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteHomeContext = async (id: string) => {
    setLoading(true);
    try {
      await deleteHomeService(id);
      await reloadHomes();
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryHomeContext = async (id: string) => {
    setLoading(true);
    try {
      const home = await setPrimaryHomeService(id);
      await reloadHomes();
      return home;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const listInvitationsContext = async (homeId: string) => {
    setLoading(true);
    try {
      const invitations = await listInvitationsService(homeId);
      return invitations;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createInvitationContext = async (homeId: string, email: string) => {
    setLoading(true);
    try {
      const invitation = await createInvitationService(homeId, email);
      return invitation;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitationContext = async (invitationId: string) => {
    setLoading(true);
    try {
      await acceptInvitationService(invitationId);
      await reloadHomes();
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectInvitationContext = async (invitationId: string) => {
    setLoading(true);
    try {
      await rejectInvitationService(invitationId);
      await reloadHomes();
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitationByTokenContext = async (token: string) => {
    setLoading(true);
    try {
      await acceptInvitationByTokenService(token);
      await reloadHomes();
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const rejectInvitationByTokenContext = async (token: string) => {
    setLoading(true);
    try {
      await rejectInvitationByTokenService(token);
      await reloadHomes();
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getHomeDetailContext = async (id: string) => {
    setLoading(true);
    try {
      const home = await getHomeService(id);
      return home;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberContext = async (homeId: string, userId: string) => {
    setLoading(true);
    try {
      const home = await removeMemberService(homeId, userId);
      await reloadHomes();
      return home;
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomesContext.Provider
      value={{
        homes,
        loading,
        reloadHomes,
        createHome: createHomeContext,
        updateHome: updateHomeContext,
        deleteHome: deleteHomeContext,
        setPrimaryHome: setPrimaryHomeContext,
        // Invitations
        listInvitations: listInvitationsContext,
        createInvitation: createInvitationContext,
        acceptInvitation: acceptInvitationContext,
        rejectInvitation: rejectInvitationContext,
        acceptInvitationByToken: acceptInvitationByTokenContext,
        rejectInvitationByToken: rejectInvitationByTokenContext,
        getHomeDetail: getHomeDetailContext,
        removeMember: removeMemberContext,
      }}
    >
      {children}
    </HomesContext.Provider>
  );
};

export function useHomes() {
  const context = useContext(HomesContext);
  if (!context) {
    throw new Error('useHomes must be used within a HomesProvider');
  }
  return context;
}
