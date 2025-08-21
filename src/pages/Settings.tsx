
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      </div>
    </div>
  );
};

export default Settings;
