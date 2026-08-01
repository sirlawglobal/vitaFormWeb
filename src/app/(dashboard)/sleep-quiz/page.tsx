'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { HelpCircle, Sliders } from 'lucide-react';

export default function SleepQuizPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">Sleep Recommendation Engine Rules</h1>
        <p className="text-xs text-slate-400 mt-1">Configure questionnaire rules and mattress scoring logic matching NestJS `sleep-quiz` module</p>
      </div>

      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Question Weighting & Product Matching</h3>
        <p className="text-xs text-slate-400">Rules mapping body weight, sleeping posture, and back pain severity to mattress SKUs.</p>
        <div className="pt-2">
          <span className="text-xs text-emerald-400 font-semibold">Active Rule Sets: 4 Configured</span>
        </div>
      </Card>
    </div>
  );
}
