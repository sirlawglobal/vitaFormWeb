'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart3, TrendingUp, Filter, ShoppingCart, ArrowRight, XCircle, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [dashRes, funnelRes, cartsRes] = await Promise.all([
        adminApi.analytics.getDashboard(groupBy),
        adminApi.analytics.getFunnelMetrics(),
        adminApi.analytics.getAbandonedCarts(50)
      ]);
      setChartData(dashRes.data?.chart || []);
      setFunnelData(funnelRes.data);
      setAbandonedCarts(cartsRes.data || []);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [groupBy]);

  const renderFunnel = () => {
    if (!funnelData) return <div className="text-sm text-slate-500">Loading funnel data...</div>;

    const steps = [
      { label: 'Viewed Product', value: funnelData.productViews || 0, color: 'bg-blue-500' },
      { label: 'Added to Cart', value: funnelData.addedToCart || 0, color: 'bg-indigo-500' },
      { label: 'Initiated Checkout', value: funnelData.initiatedCheckout || 0, color: 'bg-purple-500' },
      { label: 'Purchased', value: funnelData.purchases || 0, color: 'bg-emerald-500' },
    ];

    const maxVal = Math.max(...steps.map(s => s.value), 1);

    return (
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const percentage = ((step.value / maxVal) * 100).toFixed(1);
          return (
            <div key={idx} className="flex flex-col space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>{step.label}</span>
                <span>{step.value} users ({percentage}%)</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div className={`${step.color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Analytics & Conversion Tracking</h1>
          <p className="text-xs text-slate-400 mt-1">Live deep analytics on sales velocity, conversion funnels, and cart abandonment</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="day">Group by Day</option>
            <option value="week">Group by Week</option>
            <option value="month">Group by Month</option>
          </select>
          <button onClick={fetchAnalytics} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded text-xs font-semibold transition-colors">
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> 
              Gross Revenue Trend
            </h3>
            <div className="h-72 w-full flex items-center justify-center">
              {isMounted && !isLoading ? (
                chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₦${val / 1000000}M`} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} formatter={(val: any) => `₦${Number(val).toLocaleString()}`} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500">No revenue data for this period.</div>
                )
              ) : (
                <div className="text-xs text-slate-500 animate-pulse">Loading analytics chart...</div>
              )}
            </div>
          </Card>
        </div>

        {/* Funnel Widget */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              Checkout Funnel Drop-off
            </h3>
            {isLoading ? (
               <div className="text-xs text-slate-500 animate-pulse py-8 text-center">Loading funnel data...</div>
            ) : (
              renderFunnel()
            )}
            
            {funnelData && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Cart Abandonment Rate:</span>
                  <span className="font-bold text-rose-400">
                    {funnelData.addedToCart > 0 
                      ? (((funnelData.addedToCart - funnelData.purchases) / funnelData.addedToCart) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Why this matters
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitoring your checkout funnel allows you to see exactly where customers are dropping off. If many users initiate checkout but don't purchase, consider simplifying your payment process. Use the Abandoned Carts table to manually follow up with hot leads!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
