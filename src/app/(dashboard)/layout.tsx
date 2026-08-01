'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    setIsUnauthenticated(!token);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Header />
        {isUnauthenticated && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Authentication required for live backend admin resources (`/admin/*`).</span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 underline"
            >
              <LogIn className="h-3 w-3" />
              <span>Sign In Now</span>
            </Link>
          </div>
        )}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
