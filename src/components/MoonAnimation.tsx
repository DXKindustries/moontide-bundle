import React from 'react';

interface MoonAnimationProps {
  className?: string;
}

const MoonAnimation = ({ className = '' }: MoonAnimationProps) => (
  <div className={`flex justify-center mt-6 ${className}`}>
    <div className="text-6xl animate-float">🌙</div>
  </div>
);

export default MoonAnimation;
