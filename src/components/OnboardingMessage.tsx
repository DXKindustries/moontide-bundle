
import React from 'react';
import { MapPin, Search } from 'lucide-react';

interface OnboardingMessageProps {
  onGetStarted: () => void;
}

const OnboardingMessage = ({ onGetStarted }: OnboardingMessageProps) => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-card/20 backdrop-blur-md border border-moon-primary/20 rounded-2xl p-8">
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-moon-primary/20 rounded-full flex items-center justify-center mb-6">
            <MapPin className="w-10 h-10 text-moon-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-moon-primary to-moon-blue bg-clip-text text-transparent">
            Welcome to MoonTide
          </h1>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Track moon phases, tides, and solar information for any location. 
            To get started, please enter your ZIP code or location.
          </p>
        </div>
        
        <div className="space-y-6">
          <button
            onClick={onGetStarted}
            className="w-full bg-moon-primary hover:bg-moon-primary/90 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
          >
            <Search className="w-5 h-5" />
            Enter Location
          </button>
          
          <div className="text-sm text-muted-foreground space-y-2 opacity-80">
            <div className="flex items-center justify-center gap-2">
              <span>💡</span>
              <span>For coastal areas, enter your ZIP code for tide data</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🌙</span>
              <span>Moon and solar data available for all locations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingMessage;
