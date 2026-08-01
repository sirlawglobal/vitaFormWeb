'use client';

import { extractDataArray } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Building2, Plus, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { DealerPartner } from '@/types';
import { adminApi } from '@/lib/api';

export default function DealersPage() {
  const [dealers, setDealers] = useState<DealerPartner[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const data: any = await adminApi.getDealers();
      const liveDealers = extractDataArray(data);
      setDealers(liveDealers);
    } catch (err) {
      console.warn('[Dealers] Failed to fetch dealers:', err);
      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Authorized Dealer Network</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Vitafoam distribution partners, store locations, and verification state</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20">
          <Plus className="h-4 w-4" />
          <span>Add Dealer Partner</span>
        </button>
      </div>

      {dealers.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs">
          {loading ? 'Fetching dealer partners...' : 'No authorized dealer partners registered.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dealers.map((dealer) => (
            <Card key={dealer.id || (dealer as any)._id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-emerald-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{dealer.companyName || (dealer as any).name || 'Partner Store'}</h3>
                    <span className="text-[11px] text-slate-400">Rep: {dealer.contactPerson || 'N/A'}</span>
                  </div>
                </div>
                <Badge status={dealer.verified ? 'verified' : 'pending'}>
                  {dealer.verified ? 'Verified Dealer' : 'Pending Verification'}
                </Badge>
              </div>

              <div className="text-xs space-y-1 text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{dealer.city || 'N/A'} ({dealer.assignedRegion || 'General'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>{dealer.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{dealer.phone || 'N/A'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
