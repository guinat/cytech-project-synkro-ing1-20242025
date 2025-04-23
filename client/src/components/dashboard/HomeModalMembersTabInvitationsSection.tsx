import React, { useState, useEffect } from 'react';
import { useHomes } from '@/contexts/HomesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { HomeInvitationDeleteForm } from '@/components/3_home/forms/HomeInvitationDeleteForm';

interface InvitationsSectionProps {
  homeId: string;
  refreshKey?: number;
}

const InvitationsSection: React.FC<InvitationsSectionProps> = ({ homeId, refreshKey }) => {
  const { listInvitations, acceptInvitation, rejectInvitation } = useHomes();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [homeOwner, setHomeOwner] = useState<string|null>(null);

  // Gets the home owner (to know if user is owner)
  useEffect(() => {
    (async () => {
      try {
        const { getHome } = await import('@/services/homes.service');
        const home = await getHome(homeId);
        setHomeOwner(home.owner_id || null);
      } catch {
        setHomeOwner(null);
      }
    })();
  }, [homeId]);

  const fetchInvitations = async () => {
    setLoading(true);
    setError(null);
    try {
      const invs = await listInvitations(homeId);
      setInvitations(Array.isArray(invs) ? invs : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [homeId, refreshKey]);

  const handleAccept = async (invitationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await acceptInvitation(invitationId);
      await fetchInvitations();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Deletion by owner (DELETE)
  const handleDelete = async (invitationId: string) => {
    setLoading(true);
    setError(null);
    try {
      // @ts-ignore
      const { deleteInvitation } = await import('@/services/homes.service');
      await deleteInvitation(homeId, invitationId);
      await fetchInvitations();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Rejection by recipient (POST reject)
  const handleReject = async (invitationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await rejectInvitation(invitationId);
      await fetchInvitations();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{color: 'red'}}>Loading user or not connected.</div>;
  }
  if (!user.id) {
    return <div style={{color: 'red'}}>Unable to retrieve user ID. Please reconnect.</div>;
  }

  if (!homeOwner) {
    // Display a shadcn skeleton during loading
    return (
      <div className="space-y-2 mt-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  }

  return (
    <div>
      <label className="block mb-1 text-sm font-medium">Invitations</label>
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : invitations.length === 0 ? (
        <div className="text-sm text-gray-500">No invitations.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {invitations.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between py-2">
              <span>
                {inv.email}
                <span
                  className={
                    'ml-2 text-xs px-2 py-0.5 rounded ' +
                    (inv.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                     inv.status === 'accepted' ? 'bg-green-200 text-green-800' :
                     inv.status === 'declined' ? 'bg-red-200 text-red-800' :
                     inv.status === 'expired' ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-500')
                  }
                >
                  {inv.status}
                </span>
              </span>
              <div className="flex gap-2">
                {/* Accept: if recipient */}
                {inv.status === 'pending' && user && user.email === inv.email && (
                  <Button size="sm" variant="default" onClick={() => handleAccept(inv.id)} disabled={loading}>Accept</Button>
                )}
                {/* Delete button for the owner on any non-accepted invitation */}
                {homeOwner === user.id && inv.status !== 'accepted' && (
                  <HomeInvitationDeleteForm
                    onSubmit={async () => await handleDelete(inv.id)}
                    loading={loading}
                    className="p-0"
                  />
                )}
                {/* Reject button for the recipient if invitation is pending */}
                {inv.status === 'pending' && user.email === inv.email && homeOwner !== user.email && (
                  <Button size="sm" variant="destructive" onClick={() => handleReject(inv.id)} disabled={loading}>
                    Reject
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default InvitationsSection; 