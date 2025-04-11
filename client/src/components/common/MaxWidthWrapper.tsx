import React from 'react';
import { cn } from '@/lib/utils';

interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  withPadding?: boolean;
}

const MaxWidthWrapper: React.FC<MaxWidthWrapperProps> = ({
  className,
  children,
  fullWidth = false,
  withPadding = true,
}) => {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        fullWidth ? '' : 'max-w-screen-xl',
        withPadding ? 'px-4 sm:px-6 lg:px-8' : '',
        className
      )}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper; 