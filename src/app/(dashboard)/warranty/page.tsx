'use client';

import React from 'react';
import { SupportTabs } from '@/components/layout/SupportTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function WarrantyPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Warranty Claim Approvals</h1>
          <p className="text-xs text-slate-400 mt-1">Process customer mattress warranty registrations and damage claims</p>
        </div>
        <SupportTabs />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Claim ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Product SKU</th>
                <th className="py-3.5 px-4">Warranty Period</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-900/50">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">CLM-WAR-0081</td>
                <td className="py-3.5 px-4 font-semibold text-slate-200">Tunde Bakare</td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">VF-ORTHO-001</td>
                <td className="py-3.5 px-4 text-slate-400">5-Year Standard</td>
                <td className="py-3.5 px-4">
                  <Badge status="pending">Under Review</Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-slate-800">
                    Review Claim
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
