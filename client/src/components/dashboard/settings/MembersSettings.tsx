import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Home } from '@/services/homes.service';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';

interface MembersSettingsProps {
  home: Home;
  onInvite: (email: string, homeId: string) => Promise<void>;
}

const MembersSettings: React.FC<MembersSettingsProps> = ({
  home,
  onInvite,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
                      {/* Les actions de gestion des membres pourraient être ajoutées ici */}
                      {!member.is_owner && user && member.id !== user.id && home.permissions?.can_delete && (
                        <Button variant="destructive" size="sm" disabled>
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
    </div>
  );
};

export default MembersSettings; 