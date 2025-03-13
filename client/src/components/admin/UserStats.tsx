import React from 'react';
import { User } from '@/services/auth.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BadgeCheck, ShieldCheck, Users, TrendingUp } from 'lucide-react';

interface UserStatsProps {
  users: User[];
}

const UserStats: React.FC<UserStatsProps> = ({ users }) => {
  // Calculate statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === 'admin').length;
  const verifiedUsers = users.filter(user => user.email_verified).length;
  
  // Calculate average points
  const averagePoints = totalUsers > 0 
    ? Math.round(users.reduce((acc, user) => acc + user.points, 0) / totalUsers) 
    : 0;
  
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      description: "Total number of registered users",
      icon: <Users className="h-5 w-5 text-blue-600" />
    },
    {
      title: "Administrators",
      value: adminUsers,
      description: "Users with administration rights",
      icon: <ShieldCheck className="h-5 w-5 text-red-600" />
    },
    {
      title: "Verified Emails",
      value: verifiedUsers,
      description: "Users who have verified their email",
      icon: <BadgeCheck className="h-5 w-5 text-green-600" />
    },
    {
      title: "Average Points",
      value: averagePoints,
      description: "Average points of all users",
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />
    }
  ];

  // Get top users by points
  const topUsers = [...users]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Users</CardTitle>
          <CardDescription>Ranking of users by points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="font-semibold">{user.points}</span>
                  <span className="text-xs text-muted-foreground">points</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats; 