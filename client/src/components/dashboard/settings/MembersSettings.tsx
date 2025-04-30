import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Home } from '@/services/homes.service';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MembersSettingsProps {
  home: Home;
  onInvite: (email: string, homeId: string) => Promise<void>;
  onRemoveMember?: (homeId: string, userId: string) => Promise<void>; 
}

const MembersSettings: React.FC<MembersSettingsProps> = ({
  home,
  onInvite,
  onRemoveMember
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{id: string, name: string} | null>(null);
  const { user } = useAuth();

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onInvite(email, home.id);
      setEmail('');
      toast.success(`Invitation sent to ${email}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveMember = async () => {
    if (!memberToRemove || !onRemoveMember) return;
    
    setIsLoading(true);
    try {
      await onRemoveMember(home.id, memberToRemove.id);
      toast.success(`${memberToRemove.name} a été retiré de la maison`);
    } catch (err: any) {
      toast.error('Échec de la suppression du membre');
    } finally {
      setIsLoading(false);
      setMemberToRemove(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage the members who have access to your home
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {home.members && home.members.length > 0 ? (
                home.members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.username || member.email}</span>
                        {member.email && <span className="text-xs text-muted-foreground">{member.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        {user && (user.id === member.id || user.email === member.email) && (
                          <Badge variant="secondary">vous</Badge>
                        )}
                        {member.is_owner && (
                          <Badge variant="outline">propriétaire</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {!member.is_owner && user && member.id !== user.id && home.permissions?.can_delete && onRemoveMember && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setMemberToRemove({ 
                            id: member.id, 
                            name: member.username || member.email
                          })}
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No member
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {home.permissions?.can_invite && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Invite a new member</h3>
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
      
      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Member Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from this home? 
              They will no longer have access to this home and its devices.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isLoading}>
              {isLoading ? 'Removing...' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembersSettings; 