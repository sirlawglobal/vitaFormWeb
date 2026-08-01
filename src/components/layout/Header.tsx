'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Shield, User, LogOut, LogIn } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const getBreadcrumb = () => {
    if (pathname === '/') return 'Overview / Dashboard';
    const segment = pathname.substring(1);
    const capitalized = segment.charAt(0).toUpperCase() + segment.slice(1);
    return `Dashboard / ${capitalized}`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div className="text-xs font-medium text-slate-400">
          <span className="text-slate-500">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Global Search Input */}
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search orders, SKU, users..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-slate-950">
            3
          </span>
        </button>

        {/* Admin Profile & Auth Buttons */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold text-xs uppercase">
            {currentUser?.email ? currentUser.email.charAt(0) : 'AD'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-slate-200 max-w-[120px] truncate">
              {currentUser?.email || 'Admin User'}
            </span>
            <span className="block text-[10px] text-slate-400">
              {isLoggedIn ? 'Authenticated' : 'Guest Mode'}
            </span>
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
