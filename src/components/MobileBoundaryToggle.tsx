
import React from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, X } from 'lucide-react';

interface MobileBoundaryToggleProps {
  showBoundary: boolean;
  onToggle: () => void;
}

const MobileBoundaryToggle = ({ showBoundary, onToggle }: MobileBoundaryToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="fixed top-4 right-4 z-[60] bg-background/80 backdrop-blur-sm"
      title={`${showBoundary ? 'Hide' : 'Show'} mobile boundary (Ctrl/Cmd + M)`}
    >
      {showBoundary ? (
        <>
          <X className="h-4 w-4 mr-2" />
          Hide Mobile Frame
        </>
      ) : (
        <>
          <Smartphone className="h-4 w-4 mr-2" />
          Show Mobile Frame
        </>
      )}
    </Button>
  );
};

export default MobileBoundaryToggle;
