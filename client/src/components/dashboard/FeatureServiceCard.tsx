import React from 'react';

interface FeatureServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  category: string;
  taskType: string;
}

const FeatureServiceCard: React.FC<FeatureServiceCardProps> = ({ title, description, icon, category, taskType }) => {
  return (
    <div className="bg-card border rounded-lg shadow-md p-5 flex flex-col items-start gap-2 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-3 mb-1">
        {icon && <span className="text-2xl">{icon}</span>}
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{category}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border ml-1">{taskType}</span>
      </div>
      <div className="font-bold text-lg mb-1">{title}</div>
      <div className="text-muted-foreground text-sm">{description}</div>
    </div>
  );
};

export default FeatureServiceCard;
