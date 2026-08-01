'use client';

import React from 'react';
import { SupportTabs } from '@/components/layout/SupportTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Star, Check, X } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Product Ratings & Reviews</h1>
          <p className="text-xs text-slate-400 mt-1">Moderate customer reviews before publication on product pages</p>
        </div>
        <SupportTabs />
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200 text-sm">Oluwaseun A.</span>
                <div className="flex text-amber-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Reviewed: Vitafoam Orthopaedic Deluxe Mattress</span>
              <p className="text-xs text-slate-300 mt-2">"Extremely comfortable mattress. Solved my chronic back pain after just 3 days of sleep!"</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 font-semibold hover:bg-emerald-500/20">
                <Check className="h-3.5 w-3.5" /> Approve
              </button>
              <button className="flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs text-rose-400 font-semibold hover:bg-rose-500/20">
                <X className="h-3.5 w-3.5" /> Reject
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
