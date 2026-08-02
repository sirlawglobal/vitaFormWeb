'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Settings, ShieldAlert, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PlatformSettings } from '@/types';
import { adminApi } from '@/lib/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    appName: '',
    contactEmail: '',
    supportPhone: '',
    maintenanceMode: false,
    metadata: { bannerAnnouncement: '' },
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminApi.getSettings();
        if (response && response.data) {
          setSettings({
            ...response.data,
            metadata: response.data.metadata || { bannerAnnouncement: '' }
          });
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create payload matching UpdateSettingsDto exactly
      const payload = {
        appName: settings.appName,
        contactEmail: settings.contactEmail,
        supportPhone: settings.supportPhone,
        maintenanceMode: settings.maintenanceMode,
        // Nest metadata if we want to save custom fields not explicitly in DTO (though DTO doesn't allow metadata currently, wait! Let's check DTO)
        // Wait, DTO only allows appName, contactEmail, supportPhone, privacyPolicyUrl, termsOfServiceUrl, maintenanceMode.
        // It uses whitelist true? If so, metadata gets stripped, but we won't send it to avoid 400 bad request.
      };
      
      await adminApi.updateSettings(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Global Platform Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure mobile app parameters, global announcement banners, and toggle Maintenance Mode (`GET/PATCH /admin/settings`)
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Maintenance Mode Emergency Alert Card */}
        <Card className={`border-2 transition-all ${settings.maintenanceMode ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800 bg-slate-900/60'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${settings.maintenanceMode ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-slate-800 bg-slate-800 text-slate-400'}`}>
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Platform Maintenance Mode</h3>
                <p className="text-xs text-slate-400">
                  When enabled, non-admin mobile app & store users will see a maintenance announcement screen.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* General App Branding & Config */}
        <Card className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">Branding & System Configuration</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Platform App Name</label>
              <input
                type="text"
                value={settings.appName || ''}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Support Email Address</label>
              <input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Support Phone</label>
              <input
                type="text"
                value={settings.supportPhone || ''}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
