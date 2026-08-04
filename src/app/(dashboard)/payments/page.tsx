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

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Payment Transactions</h1>
            <p className="text-xs text-slate-400 mt-1">Audit payment gateway transactions, gateway reference logs, and process refunds</p>
          </div>
        </div>
        <SalesTabs />
      </div>

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
