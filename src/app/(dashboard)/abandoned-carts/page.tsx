'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShoppingCart, RefreshCw, PhoneCall, Mail } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AbandonedCartsPage() {
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCarts = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.analytics.getAbandonedCarts(100);
      setAbandonedCarts(res.data || []);
    } catch (err) {
      console.error('Failed to load abandoned carts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Abandoned Carts (Hot Leads)</h1>
          <p className="text-xs text-slate-400 mt-1">Users who added items to their cart but did not complete the checkout process</p>
        </div>
        <button 
          onClick={fetchCarts}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-rose-400" />
            Lead Recovery Tracker
          </h3>
          <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/10">Follow up required</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Items / Total</th>
                <th className="py-3 px-4">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500 animate-pulse">Loading leads...</td></tr>
              ) : abandonedCarts.length > 0 ? (
                abandonedCarts.map((cart, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">{formatDate(cart.lastActivityAt || cart.updatedAt)}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-400">{cart.userEmail || cart.email || 'Guest User'}</div>
                      {(cart.userPhone || cart.phone) && <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><PhoneCall className="w-3 h-3" /> {cart.userPhone || cart.phone}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-200">₦{(cart.metadata?.total || cart.total || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">{cart.metadata?.itemCount || cart.itemCount || 0} items</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {(cart.userEmail || cart.email) ? (
                          <a href={`mailto:${cart.userEmail || cart.email}?subject=Did you forget something in your Vitafoam cart?`} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold bg-emerald-500/10 px-2 py-1 rounded">
                            <Mail className="w-3 h-3" />
                            Email
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">No email</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500">No abandoned carts found. Great job!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
