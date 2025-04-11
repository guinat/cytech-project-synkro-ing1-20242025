import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground text-lg">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
            size="lg"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 