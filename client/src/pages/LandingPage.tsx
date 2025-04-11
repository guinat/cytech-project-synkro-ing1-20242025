import React from 'react';
import MaxWidthWrapper from '@/components/common/MaxWidthWrapper';

const LandingPage: React.FC = () => {
  return (
    <MaxWidthWrapper>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">Welcome to the Landing Page</h1>
      </div>
    </MaxWidthWrapper>
  );
};

export default LandingPage; 