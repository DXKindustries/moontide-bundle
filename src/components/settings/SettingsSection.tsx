
import React from 'react';

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider px-4 mb-3">
        {title}
      </h2>
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;
