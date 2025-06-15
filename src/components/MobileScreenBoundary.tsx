
import React from 'react';

const MobileScreenBoundary = () => {
  // Typical mobile screen dimensions (iPhone 14/15 as reference)
  const mobileWidth = 390; // px
  const mobileHeight = 844; // px

  return (
    <div 
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
      style={{
        width: `${mobileWidth}px`,
        height: `${mobileHeight}px`,
        border: '2px solid #ef4444',
        borderRadius: '24px', // Rounded corners like modern phones
        boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.3)',
      }}
    >
      {/* Corner indicators */}
      <div className="absolute top-2 left-2 text-red-500 text-xs font-mono bg-black/50 px-1 rounded">
        {mobileWidth}×{mobileHeight}
      </div>
      <div className="absolute bottom-2 right-2 text-red-500 text-xs font-mono bg-black/50 px-1 rounded">
        Mobile Screen
      </div>
    </div>
  );
};

export default MobileScreenBoundary;
