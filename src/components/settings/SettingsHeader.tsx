
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SettingsHeaderProps = {
  onBackPress: () => void;
};

const SettingsHeader = ({ onBackPress }: SettingsHeaderProps) => {
  const handleBackClick = () => {
    onBackPress();
  };

  return (
    <div className="sticky top-0 z-50 flex flex-col p-4 space-y-2 border-b border-gray-700 bg-background/90 backdrop-blur-sm shadow-md">
      <h1 className="w-full text-center text-xl font-semibold text-white">Settings</h1>
      <Button
        variant="ghost"
        onClick={handleBackClick}
        className="self-start text-white hover:bg-gray-700 flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>
    </div>
  );
};

export default SettingsHeader;
