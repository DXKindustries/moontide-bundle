
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StarsBackdrop from '@/components/StarsBackdrop';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsList from '@/components/settings/SettingsList';

const Settings = () => {
  const navigate = useNavigate();

  const handleBackPress = () => {
    navigate('/');
  };

  return (
    <div className="relative h-screen flex flex-col">
      <StarsBackdrop />
      <SettingsHeader onBackPress={handleBackPress} />
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 relative z-10 space-y-6">
        <SettingsList />
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            For more information, detailed instructions, and the latest updates, visit our website.
          </p>
          <Button
            variant="link"
            onClick={() => window.open('https://moontide.site', '_blank')}
          >
            Visit moontide.site
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
