'use client';

import React, { useState, useEffect } from 'react';
import { MetricCard, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign,
  Users,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Plus,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { formatDate, formatCurrency, extractDataArray } from '@/lib/utils';
import { adminApi } from '@/lib/api';

export function OverviewDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        adminApi.getDashboardOverview(),
        adminApi.getAuditLogs({ limit: 5 }),
      ]);

      const overviewRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const logsRes = results[1].status === 'fulfilled' ? results[1].value : null;

      if (overviewRes) {
        setMetrics(overviewRes?.data || overviewRes);
      }
      if (logsRes) {
        const rawLogs = extractDataArray(logsRes);
        setRecentLogs(rawLogs.slice(0, 5));
      }
    } catch (err) {
      console.warn('[Dashboard] Error fetching live metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchOverviewData();
  }, []);

  const salesData = metrics?.recentSales || metrics?.salesData || [];
  const categoryData = (metrics?.categoryDistribution || metrics?.categoryData || []).map((c: any) => ({
    category: c.category || c.name || 'General',
    sales: c.revenue || c.sales || c.count || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Platform Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics and management feed connected to NestJS backend (`vitaForm`)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-all">
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Sync Metrics</span>
          </button>
          <a
            href="/users"
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Provision Staff</span>
          </a>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sales Revenue"
          value={metrics?.totalRevenue ? formatCurrency(metrics.totalRevenue) : '₦0'}
          change="Live platform earnings"
          isPositive={true}
          icon={DollarSign}
          description="Gross platform earnings YTD"
        />
        <MetricCard
          title="Active Platform Users"
          value={metrics?.totalUsers ? String(metrics.totalUsers) : '0'}
          change="Registered accounts"
          isPositive={true}
          icon={Users}
          description="Verified accounts & customers"
        />
        <MetricCard
          title="Pending Orders"
          value={metrics?.pendingOrders !== undefined ? `${metrics.pendingOrders} Orders` : '0 Orders'}
          change="Requiring fulfillment"
          isPositive={false}
          icon={ShoppingBag}
          badgeText="Pending Fulfillment"
        />
        <MetricCard
          title="Low Stock Alerts"
          value={metrics?.lowStockCount !== undefined ? `${metrics.lowStockCount} SKUs` : '0 SKUs'}
          change="Reorder threshold alerts"
          isPositive={false}
          icon={AlertTriangle}
          badgeText="Inventory Alert"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend Area Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Revenue & Sales Performance</h2>
              <p className="text-xs text-slate-400">Monthly sales volume and revenue growth</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <TrendingUp className="h-3.5 w-3.5" /> +24.5% Growth
              </span>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {isMounted ? (
              salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `₦${val / 1000000}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500">No revenue data available yet.</div>
              )
            ) : (
              <div className="text-xs text-slate-500 animate-pulse">Loading chart analytics...</div>
            )}
          </div>
        </Card>

        {/* Category Breakdown Bar Chart */}
        <Card>
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-sm font-bold text-slate-200">Top Categories by Sales</h2>
            <p className="text-xs text-slate-400">Revenue breakdown across product lines</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {isMounted ? (
              categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(val) => `₦${val / 1000000}M`} />
                    <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={10} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, 'Sales']}
                    />
                    <Bar dataKey="sales" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-500">No category breakdown data available.</div>
              )
            ) : (
              <div className="text-xs text-slate-500 animate-pulse">Loading category metrics...</div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Audit Stream & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* System Audit Stream */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Recent Administrative Audit Logs
              </h2>
              <p className="text-xs text-slate-400">Compliance stream of actions performed by administrators</p>
            </div>
            <a href="/audit-logs" className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium">
              View All <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <div className="divide-y divide-slate-800/60">
            {recentLogs.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                {loading ? 'Fetching recent audit stream...' : 'No audit logs recorded yet.'}
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id || (log as any)._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-semibold text-slate-200">{log.adminEmail || (log as any).userEmail || 'System'}</span>
                      <span className="text-slate-400 ml-2">performed</span>
                      <Badge variant="default" className="ml-2 font-mono text-[10px]">
                        {log.action}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-300 font-medium block">{log.resource || (log as any).entity || 'N/A'}</span>
                    <span className="text-[10px] text-slate-500">{log.timestamp ? formatDate(log.timestamp) : ''}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Platform Quick Links Widget */}
        <Card>
          <div className="border-b border-slate-800 pb-4 mb-4">
            <h2 className="text-sm font-bold text-slate-200">System Shortcuts</h2>
            <p className="text-xs text-slate-400">Direct endpoints management</p>
          </div>
          <div className="space-y-2.5">
            <a
              href="/banners"
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-xs font-medium text-slate-300"
            >
              <span>Promotional Banners</span>
              <span className="text-xs text-emerald-400">Manage →</span>
            </a>
            <a
              href="/settings"
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-xs font-medium text-slate-300"
            >
              <span>Maintenance Mode Toggle</span>
              <span className="text-xs text-amber-400">Configure →</span>
            </a>
            <a
              href="/inventory"
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3 hover:border-slate-700 hover:bg-slate-800/60 transition-all text-xs font-medium text-slate-300"
            >
              <span>Low Stock Alerts</span>
              <span className="text-xs text-rose-400">Check Stock →</span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default OverviewDashboardPage;
