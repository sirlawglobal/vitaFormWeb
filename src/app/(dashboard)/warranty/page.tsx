'use client';

import React, { useState, useEffect } from 'react';
import { SupportTabs } from '@/components/layout/SupportTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, extractDataArray } from '@/lib/utils';
import { adminApi } from '@/lib/api';

export default function WarrantyPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.warranty.getPendingClaims();
      // The backend returns an array of Warranties, each containing a 'claims' array.
      // We will flatten this so each row is a specific Claim.
      const warranties = extractDataArray(res);
      const flattenedClaims: any[] = [];
      
      warranties.forEach((warranty: any) => {
        if (warranty.claims && Array.isArray(warranty.claims)) {
          warranty.claims.forEach((claim: any) => {
            if (claim.status === 'PENDING') {
              flattenedClaims.push({
                ...claim,
                warrantyId: warranty._id,
                serialNumber: warranty.serialNumber,
                warrantyPeriodYears: warranty.warrantyPeriodYears,
                user: warranty.userId,
                product: warranty.productId,
              });
            }
          });
        }
      });
      
      setClaims(flattenedClaims);
    } catch (err) {
      console.error('Failed to load claims', err);
      alert('Failed to load warranty claims');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleModerate = async (warrantyId: string, claimId: string, status: 'RESOLVED' | 'REJECTED') => {
    setActionLoading(claimId);
    try {
      await adminApi.warranty.moderateClaim(warrantyId, claimId, status);
      alert(`Claim ${status.toLowerCase()} successfully`);
      setClaims(prev => prev.filter(c => c._id !== claimId));
    } catch (err) {
      alert(`Failed to moderate claim`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Warranty Claim Approvals</h1>
            <p className="text-xs text-slate-400 mt-1">Process customer mattress warranty registrations and damage claims</p>
          </div>
          <button 
            onClick={fetchClaims}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <SupportTabs />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Product & Serial</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 animate-pulse">Loading claims...</td>
                </tr>
              ) : claims.length > 0 ? (
                claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-900/50">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">{formatDate(claim.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {claim.user ? `${claim.user.firstName || ''} ${claim.user.lastName || ''}` : 'Unknown'}
                      </div>
                      <div className="text-[10px] text-slate-500">{claim.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-emerald-400 font-semibold">{claim.product?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SN: {claim.serialNumber} ({claim.warrantyPeriodYears} Yrs)</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-400" title={claim.description}>
                      {claim.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">Under Review</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleModerate(claim.warrantyId, claim._id, 'RESOLVED')}
                          disabled={actionLoading === claim._id}
                          className="flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] text-emerald-400 font-semibold hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <CheckCircle className="h-3 w-3" /> Approve
                        </button>
                        <button 
                          onClick={() => handleModerate(claim.warrantyId, claim._id, 'REJECTED')}
                          disabled={actionLoading === claim._id}
                          className="flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-[10px] text-rose-400 font-semibold hover:bg-rose-500/20 disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 bg-slate-900/30">
                    No pending warranty claims.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
