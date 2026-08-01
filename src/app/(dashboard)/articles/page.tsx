'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Plus } from 'lucide-react';

export default function ArticlesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Articles & Sleep Guides</h1>
          <p className="text-xs text-slate-400 mt-1">Publish editorial blog posts and mattress buying guides</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20">
          <Plus className="h-4 w-4" />
          <span>New Article</span>
        </button>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Choosing the Right Orthopaedic Mattress for Spinal Alignment</h3>
            <span className="text-[10px] text-slate-400">Published on July 20, 2026 • Editorial Team</span>
          </div>
          <Badge status="active">Published</Badge>
        </div>
      </Card>
    </div>
  );
}
