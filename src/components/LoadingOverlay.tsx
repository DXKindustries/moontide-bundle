import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  className?: string;
}

export default function LoadingOverlay({ show, message = 'Loading...', className }: LoadingOverlayProps) {
  if (!show) return null;
  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm', className)}>
      <div className="flex items-center gap-3 bg-card/80 px-4 py-3 rounded-lg shadow">
        <Loader2 className="h-5 w-5 animate-spin text-moon-primary" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

