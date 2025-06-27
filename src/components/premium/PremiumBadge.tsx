import React from 'react';
import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function PremiumBadge({ size = 'md', showText = true, className = '' }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium
      bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900
      ${sizeClasses[size]} ${className}
    `}>
      <Crown className={`${iconSizes[size]} ${showText ? 'mr-1' : ''}`} />
      {showText && 'Premium'}
    </span>
  );
}