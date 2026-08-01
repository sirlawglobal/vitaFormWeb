import React from 'react';
import { cn, getStatusBadgeColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status' | 'outline';
  status?: string;
  className?: string;
}

export function Badge({ children, variant = 'status', status, className }: BadgeProps) {
  const badgeColor = status ? getStatusBadgeColor(status) : 'bg-blue-500/15 text-blue-400 border-blue-500/30';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border transition-colors',
        variant === 'status' && badgeColor,
        variant === 'default' && 'bg-slate-800 text-slate-300 border-slate-700',
        variant === 'outline' && 'border-slate-700 text-slate-400',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}
