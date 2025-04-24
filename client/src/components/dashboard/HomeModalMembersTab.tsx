import React from 'react';
import { HomeMemberInviteForm } from '@/components/3_home/forms/HomeMemberInviteForm';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import InvitationsSection from '@/components/dashboard/HomeModalMembersTabInvitationsSection';
import { useAuth } from '@/contexts/AuthContext';

interface MembersTabProps {
  homeId: string;
  members: any[];
  loadingMembers: boolean;
  loading: boolean;
  canInvite: boolean;
  onInvite: (email: string) => Promise<void>;
  error?: string | null;
}

const MembersTab: React.FC<MembersTabProps> = ({
  homeId,
  members,
  loadingMembers,
  loading,
  canInvite,
  onInvite,
  error,
}) => {
  const [refreshInvitations, setRefreshInvitations] = React.useState(0);
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <div>
        {canInvite && (
          <HomeMemberInviteForm
            onSubmit={async ({ email }) => {
              await onInvite(email);
              setRefreshInvitations(k => k + 1);
            }}
            loading={loading}
            error={error}
          />
        )}
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Current members</label>
        {loadingMembers ? (
          <div className="text-sm text-gray-500">Loading members...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted">No members</TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.username}</TableCell>
                    <TableCell className="flex gap-1 items-center">
                      {user && (user.id === member.id || user.email === member.email) && (
                        <Badge variant="secondary">you</Badge>
                      )}
                      {member.is_owner && (
                        <Badge variant="outline">owner</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <InvitationsSection homeId={homeId} refreshKey={refreshInvitations} />
    </div>
  );
};

export default MembersTab; 