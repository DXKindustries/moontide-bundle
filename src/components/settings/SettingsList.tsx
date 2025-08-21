import React from 'react';
import SettingsItem from './SettingsItem';
import { Button } from '@/components/ui/button';
import { FileText, Mail, Globe } from 'lucide-react';

const SettingsList = () => {
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <SettingsItem
        icon={FileText}
        title="Privacy Policy"
        subtitle="Read how we handle data"
        onClick={() => window.open('https://moontide.site/privacy.html', '_blank')}
      />
      <SettingsItem
        icon={FileText}
        title="Terms of Service"
        subtitle="Review our terms"
        onClick={() => window.open('https://moontide.site/terms.html', '_blank')}
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
      <SettingsItem
        icon={Globe}
        title="🌐 View NOAA Tide Station Map"
        subtitle="Explore tidal stations near you"
        onClick={() =>
          window.open(
            'https://tidesandcurrents.noaa.gov/map/index.html',
            '_blank',
            'noopener,noreferrer'
          )
        }
      />
      <div className="p-4 text-center space-y-2">
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
  );
};

export default SettingsList;

