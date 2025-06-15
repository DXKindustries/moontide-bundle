
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { FullMoonName } from '@/utils/lunarUtils';

type FullMoonBannerProps = {
  fullMoonName: FullMoonName;
  className?: string;
};

const FullMoonBanner = ({ fullMoonName, className }: FullMoonBannerProps) => {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-yellow-500/20 text-yellow-100 border-yellow-500/30 flex items-center gap-2 ${className}`}
    >
      <span className="text-lg">🌕</span>
      <span className="font-medium">{fullMoonName.name}</span>
    </Badge>
  );
};

export default FullMoonBanner;
