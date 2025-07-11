
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StarsBackdrop from '@/components/StarsBackdrop';
import SettingsHeader from '@/components/settings/SettingsHeader';
import SettingsList from '@/components/settings/SettingsList';

const Settings = () => {
  const navigate = useNavigate();

  const handleBackPress = () => {
    console.log('Back button pressed - navigating to home');
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-8 pt-16 relative overflow-y-auto">
      <StarsBackdrop />
      
      <div className="relative z-10">
        <SettingsHeader onBackPress={handleBackPress} />
        <div className="px-4 mt-6">
          <SettingsList />
        </div>
      </div>
    </div>
  );
};

export default Settings;
