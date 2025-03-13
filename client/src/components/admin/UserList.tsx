import React, { useState } from 'react';
import { User } from '@/services/auth.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Filter, ArrowUpDown, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  isLoading: boolean;
}

type SortField = 'username' | 'email' | 'role' | 'level' | 'points' | 'id';

const UserList: React.FC<UserListProps> = ({ users, onUserSelect, onDeleteUser, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle opening the delete confirmation dialog
  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Handle closing the delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = (userId: number) => {
    onDeleteUser(userId);
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  // Filter and sort users
  const filteredAndSortedUsers = [...users]
    .filter(user => {
      // Search term filter
      const searchMatch = !searchTerm || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Role filter
      const roleMatch = !roleFilter || user.role === roleFilter;
      
      // Level filter
      const levelMatch = !levelFilter || user.level === levelFilter;
      
      return searchMatch && roleMatch && levelMatch;
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'username':
          return direction * a.username.localeCompare(b.username);
        case 'email':
          return direction * a.email.localeCompare(b.email);
        case 'role':
          return direction * a.role.localeCompare(b.role);
        case 'level':
          return direction * a.level.localeCompare(b.level);
        case 'points':
          return direction * (a.points - b.points);
        case 'id':
        default:
          return direction * (a.id - b.id);
      }
    });

  // Get available roles and levels for filters
  const availableRoles = Array.from(new Set(users.map(user => user.role)));
  const availableLevels = Array.from(new Set(users.map(user => user.level)));

  const levelNames: Record<string, string> = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'expert': 'Expert'
  };

  const roleNames: Record<string, string> = {
    'user': 'User',
    'admin': 'Administrator'
  };

  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Users List</CardTitle>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent>
            <div className="px-6 py-2 bg-gray-50 border-t border-b">
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="text-sm font-medium mr-2">Role:</span>
                  <div className="flex flex-wrap mt-1 gap-1">
                    <Badge 
                      variant={roleFilter === null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setRoleFilter(null)}
                    >
                      All
                    </Badge>
                    {availableRoles.map(role => (
                      <Badge 
                        key={role}
                        variant={roleFilter === role ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setRoleFilter(role)}
                      >
                        {roleNames[role] || role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium mr-2">Level:</span>
                  <div className="flex flex-wrap mt-1 gap-1">
                    <Badge 
                      variant={levelFilter === null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setLevelFilter(null)}
                    >
                      All
                    </Badge>
                    {availableLevels.map(level => (
                      <Badge 
                        key={level}
                        variant={levelFilter === level ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setLevelFilter(level)}
                      >
                        {levelNames[level] || level}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredAndSortedUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('id')}>
                      <div className="flex items-center">ID {getSortIcon('id')}</div>
                    </th>
                    <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('username')}>
                      <div className="flex items-center">Username {getSortIcon('username')}</div>
                    </th>
                    <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('email')}>
                      <div className="flex items-center">Email {getSortIcon('email')}</div>
                    </th>
                    <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('role')}>
                      <div className="flex items-center">Role {getSortIcon('role')}</div>
                    </th>
                    <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('level')}>
                      <div className="flex items-center">Level {getSortIcon('level')}</div>
                    </th>
                    <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('points')}>
                      <div className="flex items-center">Points {getSortIcon('points')}</div>
                    </th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        // Don't select the user if clicking on action buttons
                        if (!(e.target as HTMLElement).closest('.action-menu')) {
                          onUserSelect(user);
                        }
                      }}
                    >
                      <td className="p-3 text-sm">{user.id}</td>
                      <td className="p-3 text-sm font-medium">{user.username}</td>
                      <td className="p-3 text-sm text-gray-700">{user.email}</td>
                      <td className="p-3 text-sm">
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                          {roleNames[user.role] || user.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant="secondary">
                          {levelNames[user.level] || user.level}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{user.points}</td>
                      <td className="p-3 text-sm text-right action-menu">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUserSelect(user);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteDialog(user);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No users found with the current filters
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        user={userToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default UserList; 