'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart3, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const analyticsData = [
  { month: 'Jan', revenue: 24000000 },
  { month: 'Feb', revenue: 31000000 },
  { month: 'Mar', revenue: 28000000 },
  { month: 'Apr', revenue: 42000000 },
  { month: 'May', revenue: 39000000 },
  { month: 'Jun', revenue: 48250000 },
];

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Analytics & Financial Performance</h1>
        <p className="text-xs text-slate-400 mt-1">Deep analytics on sales velocity, user acquisition, and regional growth metrics</p>
      </div>

      <Card>
        <h3 className="text-sm font-bold text-slate-200 mb-4">6-Month Gross Revenue Trend</h3>
        <div className="h-72 w-full flex items-center justify-center">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₦${val / 1000000}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-500 animate-pulse">Loading analytics chart...</div>
          )}
        </div>
      </Card>
    </div>
  );
}
