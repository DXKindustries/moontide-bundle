
import { useState, useEffect } from 'react';

export const useMobileBoundary = () => {
  const [showBoundary, setShowBoundary] = useState(false);

  // Toggle with keyboard shortcut (Ctrl/Cmd + M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setShowBoundary(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { showBoundary, setShowBoundary };
};
