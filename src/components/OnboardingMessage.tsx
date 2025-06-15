
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search } from 'lucide-react';

interface OnboardingMessageProps {
  onGetStarted: () => void;
}

const OnboardingMessage = ({ onGetStarted }: OnboardingMessageProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full bg-card/80 backdrop-blur-md border-moon-primary/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-moon-primary/20 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-moon-primary" />
            </div>
            <h2 className="text-2xl font-bold text-moon-primary">Welcome to MoonTide</h2>
            <p className="text-muted-foreground leading-relaxed">
              Track moon phases, tides, and solar information for any location. 
              To get started, please enter your ZIP code or location.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={onGetStarted}
              className="w-full bg-moon-primary hover:bg-moon-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Enter Location
            </button>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 For coastal areas, enter your ZIP code for tide data</p>
              <p>🌙 Moon and solar data available for all locations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingMessage;
