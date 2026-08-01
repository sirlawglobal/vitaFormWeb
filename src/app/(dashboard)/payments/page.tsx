'use client';

import React from 'react';
import { SalesTabs } from '@/components/layout/SalesTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PaymentsPage() {
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
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-900/50">
                <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">TXN_9984021</td>
                <td className="py-3.5 px-4 font-mono text-slate-300">VF-ORD-9012</td>
                <td className="py-3.5 px-4 text-slate-400">Paystack (Card)</td>
                <td className="py-3.5 px-4 font-bold text-slate-100">{formatCurrency(345000)}</td>
                <td className="py-3.5 px-4">
                  <Badge status="paid font-bold">Paid</Badge>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{formatDate('2026-08-01T07:30:00Z')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
