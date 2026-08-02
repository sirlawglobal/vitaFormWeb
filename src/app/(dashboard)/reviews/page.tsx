'use client';

import React, { useState, useEffect } from 'react';
import { SupportTabs } from '@/components/layout/SupportTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Star, Check, X, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { extractDataArray } from '@/lib/utils';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.reviews.getPendingReviews();
      setReviews(extractDataArray(res));
    } catch (err) {
      console.error('Failed to load reviews', err);
      alert('Failed to load pending reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminApi.reviews.approveReview(id);
      alert('Review approved successfully');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await adminApi.reviews.rejectReview(id);
      alert('Review rejected');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to reject review');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Product Ratings & Reviews</h1>
            <p className="text-xs text-slate-400 mt-1">Moderate customer reviews before publication on product pages</p>
          </div>
          <button 
            onClick={fetchReviews}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <SupportTabs />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-sm text-slate-500 animate-pulse">Loading pending reviews...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">
                      {review.userId ? `${review.userId.firstName || ''} ${review.userId.lastName || ''}` : 'Anonymous'}
                    </span>
                    <div className="flex text-amber-400">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Reviewed: <span className="font-semibold text-emerald-400">{review.productId?.name || 'Unknown Product'}</span>
                  </span>
                  <p className="text-xs text-slate-300 mt-2">"{review.comment}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => handleApprove(review._id)}
                    disabled={actionLoading === review._id}
                    className="flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button 
                    onClick={() => handleReject(review._id)}
                    disabled={actionLoading === review._id}
                    className="flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs text-rose-400 font-semibold hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-sm text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
            No pending reviews to moderate.
          </div>
        )}
      </div>
    </div>
  );
}
