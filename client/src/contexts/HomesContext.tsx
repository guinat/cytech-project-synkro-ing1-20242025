import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  listHomes,
  
  createHome,
  updateHome,
  deleteHome,
  setPrimaryHome,
  listInvitations,
  createInvitation,
  
  
  acceptInvitation,
  rejectInvitation,
  acceptInvitationByToken,
  rejectInvitationByToken,
  getHome,
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
  // Invitations
  listInvitations: (homeId: string) => Promise<HomeInvitation[]>;
  createInvitation: (homeId: string, email: string) => Promise<HomeInvitation>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  acceptInvitationByToken: (token: string) => Promise<void>;
  rejectInvitationByToken: (token: string) => Promise<void>;
  getHomeDetail: (id: string) => Promise<Home>;
}

const HomesContext = createContext<HomesContextType | undefined>(undefined);

export const HomesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [homes, setHomes] = useState<Home[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadHomes = async () => {
    setLoading(true);
    try {
      const data = await listHomes();
      setHomes(data);
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

  const handleCreateHome = async (payload: Partial<Home>) => {
    const home = await createHome(payload);
    await reloadHomes();
    return home;
  };

  const handleUpdateHome = async (id: string, payload: Partial<Home>) => {
    const home = await updateHome(id, payload);
    await reloadHomes();
    return home;
  };

  const handleDeleteHome = async (id: string) => {
    await deleteHome(id);
    await reloadHomes();
  };

  const handleSetPrimaryHome = async (id: string) => {
    const home = await setPrimaryHome(id);
    await reloadHomes();
    return home;
  };

  // Invitations
  const handleListInvitations = async (homeId: string) => {
    return await listInvitations(homeId);
  };

  const handleCreateInvitation = async (homeId: string, email: string) => {
    return await createInvitation(homeId, email);
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    await acceptInvitation(invitationId);
    await reloadHomes();
  };

  const handleRejectInvitation = async (invitationId: string) => {
    await rejectInvitation(invitationId);
    await reloadHomes();
  };

  // Fonctions token
  const handleAcceptInvitationByToken = async (token: string) => {
    await acceptInvitationByToken(token);
    await reloadHomes();
  };
  const handleRejectInvitationByToken = async (token: string) => {
    await rejectInvitationByToken(token);
    await reloadHomes();
  };

  // Détail d'une maison (avec membres)
  const handleGetHomeDetail = async (id: string) => {
    return await getHome(id);
  };

  return (
    <HomesContext.Provider
      value={{
        homes,
        loading,
        reloadHomes,
        createHome: handleCreateHome,
        updateHome: handleUpdateHome,
        deleteHome: handleDeleteHome,
        setPrimaryHome: handleSetPrimaryHome,
        listInvitations: handleListInvitations,
        createInvitation: handleCreateInvitation,
        acceptInvitation: handleAcceptInvitation,
        rejectInvitation: handleRejectInvitation,
        acceptInvitationByToken: handleAcceptInvitationByToken,
        rejectInvitationByToken: handleRejectInvitationByToken,
        getHomeDetail: handleGetHomeDetail,
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
