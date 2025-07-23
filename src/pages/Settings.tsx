
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StarsBackdrop from '@/components/StarsBackdrop';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsList from '@/components/settings/SettingsList';

const Settings = () => {
  const navigate = useNavigate();

  const handleBackPress = () => {    navigate('/');
  };

  return (
    <div className="min-h-screen pb-8 pt-16 relative overflow-y-auto">
      <StarsBackdrop />
      
      <div className="relative z-10">
        <SettingsHeader onBackPress={handleBackPress} />
        <div className="px-4 mt-6">
          <SettingsList />
          <div className="mt-12 text-center space-y-2">
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
    </div>
  );
};

export default Settings;
