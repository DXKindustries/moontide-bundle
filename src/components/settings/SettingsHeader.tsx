
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SettingsHeaderProps = {
  onBackPress: () => void;
};

const SettingsHeader = ({ onBackPress }: SettingsHeaderProps) => {
  const handleBackClick = () => {    onBackPress();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-gray-700 bg-background/90 backdrop-blur-sm shadow-md">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBackClick}
        className="text-white hover:bg-gray-700"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <h1 className="text-xl font-semibold text-white">Settings</h1>
      
      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  );
};

export default SettingsHeader;
