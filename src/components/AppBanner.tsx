import React from 'react';
import { CloudMoon } from 'lucide-react';

interface AppBannerProps {
  className?: string;
}

const AppBanner = ({ className = '' }: AppBannerProps) => (
  <div className={`flex items-center justify-center gap-2 ${className}`}>
    <CloudMoon className="h-8 w-8 text-moon-primary" />
    <h1 className="text-2xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
      MoonTide
    </h1>
  </div>
);

export default AppBanner;
