'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, extractDataArray } from '@/lib/utils';
import { adminApi } from '@/lib/api';
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingBag,
  CreditCard,
  Users,
  Building2,
  Image as ImageIcon,
  Ticket,
  FileText,
  HelpCircle,
  MessageSquare,
  Star,
  ShieldCheck,
  BarChart3,
  ScrollText,
  Settings,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface NavGroup {
  section: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string | number;
  }[];
}

const navigationGroups: NavGroup[] = [
  {
    section: 'OVERVIEW',
    items: [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }],
  },
  {
    section: 'CATALOG',
    items: [
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Categories', href: '/categories', icon: Tags },
      { name: 'Inventory', href: '/inventory', icon: Boxes },
    ],
  },
  {
    section: 'SALES',
    items: [
      { name: 'Orders', href: '/orders', icon: ShoppingBag, badge: '12' },
      { name: 'Payments', href: '/payments', icon: CreditCard },
    ],
  },
  {
    section: 'PEOPLE',
    items: [
      { name: 'Users & Staff', href: '/users', icon: Users },
      { name: 'Dealers', href: '/dealers', icon: Building2 },
    ],
  },
  {
    section: 'MARKETING',
    items: [
      { name: 'Banners', href: '/banners', icon: ImageIcon },
      { name: 'Promotions', href: '/promotions', icon: Ticket },
      { name: 'Articles', href: '/articles', icon: FileText },
      { name: 'Sleep Quiz', href: '/sleep-quiz', icon: HelpCircle },
    ],
  },
  {
    section: 'SUPPORT',
    items: [
      { name: 'Support Chat', href: '/support-chat', icon: MessageSquare, badge: 'Active' },
      { name: 'Reviews', href: '/reviews', icon: Star },
      { name: 'Warranty Claims', href: '/warranty', icon: ShieldCheck },
    ],
  },
  {
    section: 'ANALYTICS',
    items: [{ name: 'Reports', href: '/analytics', icon: BarChart3 }],
  },
  {
    section: 'SYSTEM',
    items: [
      { name: 'Audit Logs', href: '/audit-logs', icon: ScrollText },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await adminApi.getLowStock();
        const data = extractDataArray(res);
        if (data.length > 0) {
          setLowStockCount(data.length);
        }
      } catch (err) {
        console.warn('Failed to fetch low stock count for sidebar');
      }
    };
    fetchLowStock();
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 font-bold text-slate-950 shadow-md shadow-emerald-500/20">
            V
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-100">VITAFOAM</span>
            <span className="block text-[10px] font-semibold tracking-widest text-emerald-400 uppercase">
              Admin Control Center
            </span>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav className="h-[calc(100vh-8rem)] overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {navigationGroups.map((group) => (
            <div key={group.section}>
              <div className="px-3 mb-1.5 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                {group.section}
              </div>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  
                  let dynamicBadge = item.badge;
                  if (item.name === 'Inventory' && lowStockCount !== null) {
                    dynamicBadge = `${lowStockCount} Low`;
                  }

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm shadow-emerald-950/30'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={cn(
                              'h-4 w-4 transition-colors',
                              isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                            )}
                          />
                          <span>{item.name}</span>
                        </div>
                        {dynamicBadge && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap',
                              typeof dynamicBadge === 'string' && dynamicBadge.includes('Low') || dynamicBadge === 'Active'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            )}
                          >
                            {dynamicBadge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="border-t border-slate-800 p-4 bg-slate-900/40">
        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/80 p-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">vitaForm Connected</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
