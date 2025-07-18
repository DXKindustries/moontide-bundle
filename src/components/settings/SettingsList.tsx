
import React from 'react';
import SettingsSection from './SettingsSection';
import SettingsItem from './SettingsItem';
import {
  User,
  MapPin,
  Bell,
  Palette,
  Globe,
  Shield,
  HelpCircle,
  Info,
  Star,
  Share2,
  FileText,
  Mail
} from 'lucide-react';

const SettingsList = () => {
  return (
    <div className="space-y-8">
      {/* Account Section */}
      <SettingsSection title="Account">
        <SettingsItem
          icon={User}
          title="Profile"
          subtitle="Manage your account information"
          onClick={() => console.log('Profile clicked')}
        />
        <SettingsItem
          icon={MapPin}
          title="Saved Locations"
          subtitle="Manage your favorite tide locations"
          onClick={() => console.log('Saved Locations clicked')}
        />
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection title="Preferences">
        <SettingsItem
          icon={Bell}
          title="Notifications"
          subtitle="Tide alerts and reminders"
          onClick={() => console.log('Notifications clicked')}
        />
        <SettingsItem
          icon={Palette}
          title="Appearance"
          subtitle="Theme and display options"
          onClick={() => console.log('Appearance clicked')}
        />
        <SettingsItem
          icon={Globe}
          title="Units"
          subtitle="Distance, time, and measurement units"
          onClick={() => console.log('Units clicked')}
        />
      </SettingsSection>

      {/* Privacy & Security Section */}
      <SettingsSection title="Privacy & Security">
        <SettingsItem
          icon={Shield}
          title="Privacy Settings"
          subtitle="Control your data and privacy"
          onClick={() => console.log('Privacy clicked')}
        />
      </SettingsSection>

      {/* Support Section */}
      <SettingsSection title="Support">
        <SettingsItem
          icon={HelpCircle}
          title="Help & FAQ"
          subtitle="Get help and find answers"
          onClick={() => console.log('Help clicked')}
        />
        <SettingsItem
          icon={Info}
          title="About"
          subtitle="App version and information"
          onClick={() => console.log('About clicked')}
        />
        <SettingsItem
          icon={Star}
          title="Rate MoonTide"
          subtitle="Share your experience"
          onClick={() => console.log('Rate clicked')}
        />
        <SettingsItem
          icon={Share2}
          title="Share App"
          subtitle="Tell friends about MoonTide"
          onClick={() => console.log('Share clicked')}
        />
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
          onClick={() => window.open('mailto:moontidesite@gmail.com?subject=' + encodeURIComponent('Moontide App Feedback'), '_blank')}
        />
      </SettingsSection>
    </div>
  );
};

export default SettingsList;
