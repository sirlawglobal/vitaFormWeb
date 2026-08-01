import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  description?: string;
  badgeText?: string;
  badgeStatus?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  description,
  badgeText,
  badgeStatus = 'pending',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-950/20 group',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="rounded-lg border border-slate-800 bg-slate-800/50 p-2 text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{value}</h3>
        {change && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold rounded-md px-2 py-0.5',
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            )}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>

      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
      {badgeText && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Alert Status</span>
          <span className="font-medium text-amber-400">{badgeText}</span>
        </div>
      )}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl', className)}>
      {children}
    </div>
  );
}
