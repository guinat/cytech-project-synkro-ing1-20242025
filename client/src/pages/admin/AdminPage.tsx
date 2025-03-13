import React, { useEffect, useState } from 'react';
import { User } from '@/services/auth.service';
import adminService from '@/services/admin.service';
import { toast } from 'sonner';
import { Alert } from '@/components/ui/alert';
import { ApiError } from '@/services/api';

import DashboardHeader from '@/components/admin/DashboardHeader';
import UserStats from '@/components/admin/UserStats';
import UserList from '@/components/admin/UserList';
import UserDetail from '@/components/admin/UserDetail';



const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.getAllUsers();
      setUsers(data);
      
      // If a user is selected, update their data with fresh data
      if (selectedUser) {
        const updatedSelectedUser = data.find(user => user.id === selectedUser.id);
        if (updatedSelectedUser) {
          setSelectedUser(updatedSelectedUser);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      let errorMessage = 'Error retrieving users. Please try again.';
      
      if (err instanceof ApiError) {
        if (err.status === 403) {
          errorMessage = 'You do not have the necessary permissions to access this resource. Only administrators can view this page.';
        } else if (err.status === 404) {
          errorMessage = 'The requested resource was not found. Please verify that the backend is correctly configured.';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      setIsLoading(true);
      await adminService.deleteUser(userId);
      toast.success('User successfully deleted');
      
      // If the deleted user is the one currently selected, deselect it
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
      
      // Refresh the user list
      fetchUsers();
    } catch (error) {
      toast.error('Error while deleting: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    // If we are on another tab, switch to the users tab
    if (activeTab !== 'users') {
      setActiveTab('users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Conditional rendering based on active tab
  const renderTabContent = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <UserStats users={users} />;
      
      case 'users':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UserList 
                users={users} 
                onUserSelect={handleSelectUser} 
                onDeleteUser={handleDeleteUser}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-1">
              <UserDetail 
                user={selectedUser} 
                onUserUpdated={fetchUsers}
                onClose={() => setSelectedUser(null)}
              />
            </div>
          </div>
        );
      
      default:
        return <UserStats users={users} />;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {isLoading && activeTab === 'overview' ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default AdminPage; 