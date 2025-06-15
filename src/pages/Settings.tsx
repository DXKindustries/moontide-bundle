
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
    console.log('Back button pressed');
    // Try navigating to home as fallback if navigate(-1) doesn't work
    try {
      navigate(-1);
    } catch (error) {
      console.log('Navigate(-1) failed, navigating to home:', error);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pb-8 relative">
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
