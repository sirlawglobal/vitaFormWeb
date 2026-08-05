'use client';

import React, { useState, useEffect } from 'react';
import { SalesTabs } from '@/components/layout/SalesTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, extractDataArray } from '@/lib/utils';
import { adminApi } from '@/lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState('paystack');
  const [savingGateway, setSavingGateway] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data: any = await adminApi.getPayments();
      const list = extractDataArray(data);
      setPayments(list);
    } catch (err) {
      console.warn('[Payments] Failed to fetch payment transactions:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGatewaySettings = async () => {
    try {
      const res: any = await adminApi.getGateways();
      const data = res?.data ?? res;
      if (data?.defaultProvider) {
        setActiveProvider(data.defaultProvider.toLowerCase());
      }
    } catch (err) {
      console.warn('[Payments] Failed to fetch gateway settings:', err);
    }
  };

  const handleUpdateGateway = async (provider: string) => {
    setSavingGateway(true);
    try {
      await adminApi.updateGateways({ defaultProvider: provider, enabledProviders: [provider] });
      setActiveProvider(provider.toLowerCase());
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update active payment provider');
    } finally {
      setSavingGateway(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchGatewaySettings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Payment Gateway & Transactions</h1>
            <p className="text-xs text-slate-400 mt-1">Configure customer checkout payment provider and audit transaction logs</p>
          </div>
        </div>
        <SalesTabs />
      </div>

      {/* Gateway Switcher Card */}
      <Card className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Active Checkout Payment Provider</h2>
            <p className="text-[11px] text-slate-400">Select which payment option is displayed to customers at storefront checkout</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
            Active: {activeProvider}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {['paystack', 'flutterwave', 'moniepoint', 'opay'].map((provider) => {
            const isSelected = activeProvider === provider;
            return (
              <button
                key={provider}
                disabled={savingGateway}
                onClick={() => handleUpdateGateway(provider)}
                className={`p-3 rounded-lg border text-xs font-bold capitalize transition-all text-center flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-950/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{provider}</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {isSelected ? '✓ Active' : 'Click to Enable'}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4">Channel / Provider</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Fetching transactions...' : 'No payment transactions recorded.'}
                  </td>
                </tr>
              ) : (
                payments.map((tx: any) => (
                  <tr key={tx._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{tx.paymentRef}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{tx.orderNumber || tx.checkoutRef}</td>
                    <td className="py-3.5 px-4 text-slate-400 capitalize">{tx.provider}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{formatCurrency(tx.amount || 0)}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={tx.status || 'PENDING'}>{tx.status || 'PENDING'}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
