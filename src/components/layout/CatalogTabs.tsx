'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Package, Tags, Boxes } from 'lucide-react';

export function CatalogTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Tags },
    { name: 'Inventory & Stock Alerts', href: '/inventory', icon: Boxes },
  ];

  return (
    <div className="mb-6 border-b border-slate-800 pb-2">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-400' : 'text-slate-400')} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
