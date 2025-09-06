
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarsBackdrop from '@/components/StarsBackdrop';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsList from '@/components/settings/SettingsList';
import versionFile from '../../android/version.properties?raw';

const match = versionFile.match(/VERSION_CODE=(\d+)/);
const appVersion = `1.0.${match ? Number(match[1]) + 1 : 1}`;

const Settings = () => {
  const navigate = useNavigate();

  const handleBackPress = () => {
    navigate('/');
  };

  return (
    <div className="relative h-screen flex flex-col">
      <StarsBackdrop />
      <SettingsHeader onBackPress={handleBackPress} appVersion={appVersion} />
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 relative z-10 space-y-6">
        <SettingsList />
      </div>
    </div>
  );
};

export default Settings;
