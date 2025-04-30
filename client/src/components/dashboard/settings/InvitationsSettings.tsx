import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Home, HomeInvitation, listInvitations, deleteInvitation } from '@/services/homes.service';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface InvitationsSettingsProps {
  home: Home;
  onInvite: (email: string, homeId: string) => Promise<void>;
}

const InvitationsSettings: React.FC<InvitationsSettingsProps> = ({
  home,
  onInvite,
}) => {
  const [invitations, setInvitations] = useState<HomeInvitation[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const invs = await listInvitations(home.id);
      setInvitations(invs);
    } catch (err: any) {
      toast.error(`Failed to load invitations: ${err.message}`);
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    if (home.id) {
      fetchInvitations();
    }
  }, [home.id]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onInvite(email, home.id);
      setEmail('');
      toast.success(`Invitation sent to ${email}`);
      fetchInvitations();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    setIsLoading(true);
    try {
      await deleteInvitation(home.id, invitationId);
      toast.success("Invitation deleted successfully");
      fetchInvitations();
    } catch (err: any) {
      toast.error(`Failed to delete invitation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'accepted': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'declined': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'expired': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default: return '';
    }
  };

  const isHomeOwner = home.permissions?.can_delete || false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            Manage the invitations to your home
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingInvitations ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No invitations in progress</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusClass(invitation.status)}
                      >
                        {getStatusDisplay(invitation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isHomeOwner && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {isHomeOwner && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Send a new invitation</h3>
              <form onSubmit={handleInviteSubmit} className="flex gap-2" autoComplete="off">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Invite'}
                </Button>
              </form>
              {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationsSettings; 