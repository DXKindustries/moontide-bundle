
import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SettingsItemProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
};

const SettingsItem = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  onClick,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange
}: SettingsItemProps) => {
  return (
    <Button
      variant="ghost"
      className="w-full h-auto p-4 flex items-center justify-between hover:bg-gray-700/50 border-b border-gray-700 last:border-b-0 rounded-none whitespace-normal"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-moon-primary/20 rounded-lg">
          <Icon className="h-5 w-5 text-moon-primary" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-white font-medium">{title}</span>
          <span className="text-gray-400 text-sm">{subtitle}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {hasSwitch && onSwitchChange ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwitchChange(!switchValue);
            }}
            className={`w-12 h-6 rounded-full transition-colors ${
              switchValue ? 'bg-moon-primary' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                switchValue ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </Button>
  );
};

export default SettingsItem;
