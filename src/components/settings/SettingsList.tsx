import React from 'react';
import SettingsItem from './SettingsItem';
import { FileText, Mail } from 'lucide-react';

const SettingsList = () => {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <SettingsItem
        icon={FileText}
        title="Privacy Policy"
        subtitle="Read how we handle data"
        onClick={() => window.open('https://moontide.site/privacy', '_blank')}
      />
      <SettingsItem
        icon={FileText}
        title="Terms of Service"
        subtitle="Review our terms"
        onClick={() => window.open('https://moontide.site/terms', '_blank')}
      />
      <SettingsItem
        icon={Mail}
        title="Send Feedback or Suggestions"
        subtitle="We'd love to hear from you"
        onClick={() =>
          window.open(
            'mailto:moontidesite@gmail.com?subject=' +
              encodeURIComponent('Moontide App Feedback'),
            '_blank'
          )
        }
      />
    </div>
  );
};

export default SettingsList;

