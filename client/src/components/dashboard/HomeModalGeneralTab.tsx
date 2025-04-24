import React from 'react';
import { HomeRenameForm } from '@/components/3_home/forms/HomeRenameForm';
import { HomeColorChangeForm } from '@/components/3_home/forms/HomeColorChangeForm';

interface GeneralTabProps {
  currentName: string;
  currentColor: string;
  loading: boolean;
  onRename: (name: string) => Promise<void>;
  onColorChange: (data: { color: string }) => Promise<void>;
  error?: string | null;
}

const predefinedColors = [
  { background: '#fef2f2', tailwindColor: 'red' },
  { background: '#fefce8', tailwindColor: 'yellow' },
  { background: '#ecfdf5', tailwindColor: 'green' },
  { background: '#ecfeff', tailwindColor: 'sky' },
  { background: '#fdf4ff', tailwindColor: 'purple' },
  { background: '#fdf2f8', tailwindColor: 'pink' },
  { background: '#f9fafb', tailwindColor: 'gray' },
];

const GeneralTab: React.FC<GeneralTabProps> = ({
  currentName,
  currentColor,
  loading,
  onRename,
  onColorChange,
  error,
}) => {


  return (
    <div className="space-y-4">
      <div>
        <HomeRenameForm
          currentName={currentName}
          onSubmit={async ({ name }) => onRename(name)}
          loading={loading}
          error={error}
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Color</label>
        <div className="flex gap-2 flex-wrap mt-2">
          {predefinedColors.map(({ background, tailwindColor }) => {
            const isSelected = currentColor === background;
            return (
              <HomeColorChangeForm
                key={background}
                color={background}
                onSubmit={onColorChange}
                loading={loading && isSelected}
                error={error}
              >
                <span
                  className={`w-7 h-7 rounded-full border-2 border-${tailwindColor}-300 ${isSelected ? `ring-2 ring-${tailwindColor}-800` : ''} transition-all block`}
                  style={{ background }}
                  aria-label={`Choose color ${tailwindColor}`}
                />
              </HomeColorChangeForm>
            );
          })}
        </div>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </div>
    </div>
  );
};

export default GeneralTab;