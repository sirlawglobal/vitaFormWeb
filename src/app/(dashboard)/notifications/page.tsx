'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Send, Bell, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'PROMO',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      alert('Title and Body are required.');
      return;
    }

    if (!confirm('Are you sure you want to send this broadcast notification to all eligible users? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.broadcastNotification(formData);
      const sentCount = res?.data?.sentCount ?? 0;
      alert(`Broadcast successful! Triggered ${sentCount} notifications.`);
      setFormData({ title: '', body: '', type: 'PROMO' });
    } catch (err: any) {
      console.error('[Broadcast Error]', err);
      alert('Failed to send broadcast: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Bell className="h-6 w-6 text-emerald-400" />
            Broadcast Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Send push and in-app notifications to all eligible users simultaneously.
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <Card className="p-6">
          <form onSubmit={handleBroadcast} className="space-y-6">
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Notification Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Flash Sale Live!"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Category Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                >
                  <option value="PROMO">Promotional</option>
                  <option value="SYSTEM">System Announcement</option>
                  <option value="ORDER">Order Updates</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Message Body <span className="text-red-400">*</span></label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Write your broadcast message here..."
                rows={4}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500 resize-none"
                required
              />
              <p className="text-xs text-slate-500 text-right">
                {formData.body.length} / 200 characters recommended for push notifications.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{loading ? 'Broadcasting...' : 'Send Broadcast'}</span>
              </button>
            </div>

          </form>
        </Card>
        
        <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3">
          <div className="text-amber-500 mt-0.5">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-200">Important Notice</h4>
            <p className="text-xs text-amber-300/80 mt-1">
              Broadcasts are sent to all users who have not opted out of push notifications. 
              Use this feature sparingly to avoid spamming customers. A record of this action will be saved in the Audit Logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
