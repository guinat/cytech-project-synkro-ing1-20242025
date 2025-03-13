import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Users } from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-4 w-4 mr-2" /> },
  ];

  return (
    <Card className="mb-6 shadow-none">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-center justify-between p-4">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-blue-500 p-2 rounded-md text-white mr-3">
              <LayoutDashboard className="h-6 w-6" />
            </div>
              <h1 className="h1-title">Admin Dashboard</h1>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors hover:text-primary ${
                activeTab === tab.id
                  ? 'bg-primary/5 text-primary' + (tab.id === 'overview' ? ' rounded-bl-md' : '')
                  : 'text-muted-foreground'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHeader; 