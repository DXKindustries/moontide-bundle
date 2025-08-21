
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
    <div className="fixed top-0 left-0 right-0 z-50 p-4 border-b border-gray-700 bg-background/90 backdrop-blur-sm shadow-md flex flex-col items-center gap-2">
      <h1 className="text-xl font-semibold text-white">Settings</h1>
      <Button
        variant="ghost"
        onClick={handleBackClick}
        className="text-white hover:bg-gray-700 flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>
    </div>
  );
};

export default SettingsHeader;
