import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import MaxWidthWrapper from '../components/common/MaxWidthWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/ui/status-badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const { user, isLoading, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  
  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent successfully. Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again later.');
    }
  };
  
  if (isLoading) {
    return (
      <MaxWidthWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-lg text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </MaxWidthWrapper>
    );
  }
  
  if (!user) {
    return (
      <MaxWidthWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">You're not signed in</h2>
            <p className="mb-6 text-gray-600">Please sign in to view your dashboard.</p>
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    );
  }
  
  // Helper function to get badge variant based on level
  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'info';
      case 'intermediate':
        return 'success'; 
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Helper function to get progress color based on level
  const getProgressColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-600';
      case 'intermediate':
        return 'bg-green-600';
      case 'advanced':
        return 'bg-purple-600';
      default:
        return 'bg-yellow-600';
    }
  };
  
  return (
    <MaxWidthWrapper>
      <div className="min-h-screen py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="h1-title">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="h3-title">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <Separator />
              <div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    {user.email_verified ? (
                        <StatusBadge variant="success" text="Verified" position="inline" />
                    ) : (
                        <div className="flex w-full justify-between items-center space-x-2">
                            <StatusBadge variant="warning" text="Not verified" position="inline" />
                            <Button 
                                variant="link" 
                                className="text-xs p-0 h-auto cursor-pointer text-muted-foreground" 
                                onClick={handleResendVerification}
                            >
                                Resend verification email
                            </Button>
                        </div>
                    )}
                </div>
                <p className="font-medium">{user.email}</p>
              </div>

              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Account created on</p>
                <p className="font-medium">
                  {new Date(user.date_joined).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Separator />
              <Button className='w-full' variant='outline' onClick={() => navigate('/profile/edit')}>Edit Profile</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className='h3-title'>Progression</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Current level</p>
                <div className="flex items-center space-x-2">
                  <StatusBadge 
                    variant={getLevelBadgeVariant(user.level)} 
                    text={user.level.charAt(0).toUpperCase() + user.level.slice(1)}
                    position="inline"
                    pulse={false}
                  />
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="font-medium">{user.points}</p>
              </div>
              <Separator />
              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    {user.level === 'beginner' 
                      ? `${user.points}/100 points to Intermediate`
                      : user.level === 'intermediate'
                      ? `${user.points}/500 points to Advanced`
                      : user.level === 'advanced'
                      ? `${user.points}/1000 points to Expert`
                      : `${user.points} total points (Expert)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(user.level)}`}
                    style={{ 
                      width: `${
                        user.level === 'beginner' 
                          ? (user.points / 100) * 100
                          : user.level === 'intermediate'
                          ? (user.points / 500) * 100
                          : user.level === 'advanced'
                          ? (user.points / 1000) * 100
                          : 100
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default DashboardPage; 