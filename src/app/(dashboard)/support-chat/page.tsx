'use client';

import React from 'react';
import { SupportTabs } from '@/components/layout/SupportTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Send, User } from 'lucide-react';

export default function SupportChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Live Support Chat Monitor</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time support ticket channels connected to NestJS `support-chat` module</p>
        </div>
        <SupportTabs />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 h-[500px]">
        <Card className="p-3 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Active Conversations</h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex justify-between text-xs font-semibold text-slate-200">
                <span>Chinedu Eze</span>
                <span className="text-[10px] text-emerald-400">Just now</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">Hi, when will order #9012 arrive in Ikeja?</p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 flex flex-col justify-between p-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Chinedu Eze</h3>
              <span className="text-[10px] text-slate-400">Order #VF-ORD-9012 • Lagos Depot</span>
            </div>
            <Badge status="active">Active Session</Badge>
          </div>
          <div className="flex-1 py-4 space-y-3 overflow-y-auto">
            <div className="bg-slate-800 text-slate-200 p-3 rounded-xl max-w-md text-xs">
              Hi, when will order #9012 arrive in Ikeja?
            </div>
            <div className="bg-emerald-600 text-slate-950 p-3 rounded-xl max-w-md text-xs font-medium ml-auto">
              Hello Chinedu! Your order has been dispatched and is currently in transit. It will arrive today before 4 PM.
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
            <input
              type="text"
              placeholder="Type reply to customer..."
              className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button className="rounded-lg bg-emerald-500 p-2.5 text-slate-950 hover:bg-emerald-400 font-bold">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
