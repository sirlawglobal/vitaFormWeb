'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Ticket, Plus } from 'lucide-react';

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Promotions & Vouchers</h1>
          <p className="text-xs text-slate-400 mt-1">Configure discount vouchers, promo campaigns, and minimum purchase thresholds</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20">
          <Plus className="h-4 w-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded">
              VITAMAT25
            </span>
            <Badge status="active">Active Campaign</Badge>
          </div>
          <h3 className="text-sm font-bold text-slate-100">25% Off All Mattresses</h3>
          <p className="text-xs text-slate-400">Valid for orders exceeding ₦200,000. Maximum discount cap: ₦50,000.</p>
        </Card>
      </div>
    </div>
  );
}
