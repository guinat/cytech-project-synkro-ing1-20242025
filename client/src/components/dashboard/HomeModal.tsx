import React, { useState, useEffect } from 'react';
import { useHomes } from '@/contexts/HomesContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Home } from '@/services/homes.service';

import MembersTab from '@/components/dashboard/HomeModalMembersTab';
import GeneralTab from '@/components/dashboard/HomeModalGeneralTab';
import { HomeDeleteForm } from '@/components/3_home/forms/HomeDeleteForm';

interface HomeModalProps {
  open: boolean;
  onClose: () => void;
  home: Home;
  onRename?: (name: string) => Promise<void>;
  onColorChange?: (color: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onInvite?: (email: string) => Promise<void>;
  onCreateRoom?: (name: string) => Promise<void>;
  onAddDevice?: (roomId: string, deviceName: string) => Promise<void>;
}

const HomeModal: React.FC<HomeModalProps> = ({
  open,
  onClose,
  home,
  onRename,
  onColorChange,
  onDelete,
  onInvite,
}) => {
  const { getHomeDetail } = useHomes();
  
  const [homeDetail, setHomeDetail] = useState<Home | null>(null);
  const [loadingHomeDetail, setLoadingHomeDetail] = useState(false);
  const [tab, setTab] = useState<'general' | 'members' | 'rooms' | 'devices'>('general');
  
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    if (open && home?.id) {
      setLoadingHomeDetail(true);
      getHomeDetail(home.id)
        .then(detail => {
          setHomeDetail(detail);
          
        })
        .finally(() => setLoadingHomeDetail(false));
    } else {
      setHomeDetail(null);
      
    }
  }, [open, home?.id, getHomeDetail]);

  useEffect(() => {
    if (!open || !homeDetail?.id) return;
    setLoadingMembers(true);
    getHomeDetail(homeDetail.id)
      .then((freshHomeDetail) => {
        setMembers(freshHomeDetail.members || []);
      })
      .finally(() => setLoadingMembers(false));
  }, [open, homeDetail?.id, getHomeDetail]);


  if (loadingHomeDetail || !homeDetail) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Home Details</DialogTitle>
            <DialogDescription>Loading home information...</DialogDescription>
          </DialogHeader>
          <Skeleton className="h-40 w-full" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{homeDetail.name}</DialogTitle>
          <DialogDescription>
            Manage the information for this home.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 mb-4">
          <Button variant={tab === 'general' ? 'default' : 'outline'} onClick={() => setTab('general')} size="sm">General</Button>
          <Button variant={tab === 'members' ? 'default' : 'outline'} onClick={() => setTab('members')} size="sm">Members</Button>
        </div>
        
        {tab === 'general' && (
  <GeneralTab
    currentName={homeDetail.name}
    currentColor={homeDetail.color || '#D1D5DB'}
    loading={loading}
    error={error}
    onRename={async (name: string) => {
      if (!onRename) return;
      setLoading(true);
      setError(null);
      try {
        await onRename(name);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }}
    onColorChange={async (data: { color: string }) => {
      if (!onColorChange) return;
      setLoading(true);
      setError(null);
      try {
        await onColorChange(data.color);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }}
  />
)}
        
        {tab === 'members' && (
  <MembersTab
    homeId={homeDetail.id}
    members={members}
    loadingMembers={loadingMembers}
    loading={loading}
    canInvite={!!homeDetail.permissions?.can_invite}
    onInvite={async (email: string) => {
      if (!onInvite) return;
      setLoading(true);
      setError(null);
      try {
        await onInvite(email);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }}
    error={error}
  />
)}
        
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {homeDetail.permissions?.can_delete && (
  <HomeDeleteForm
    onSubmit={async () => {
      if (!onDelete) return;
      setLoading(true);
      setError(null);
      try {
        await onDelete();
        onClose();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }}
    loading={loading}
    error={error}
  />
)}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HomeModal; 