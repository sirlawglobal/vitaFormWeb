'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Ticket, Plus, Edit, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { extractDataArray, getStatusBadgeColor } from '@/lib/utils';

export interface Promotion {
  id?: string;
  _id?: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimitTotal: number;
  usageLimitPerUser: number;
  usedCount: number;
  startDate: string;
  expiresAt: string;
  isActive: boolean;
  description?: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Promotion>>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimitTotal: 0,
    usageLimitPerUser: 1,
    startDate: '',
    expiresAt: '',
    isActive: true,
    description: '',
  });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;

      const response: any = await adminApi.getPromotions(params);
      const livePromos = extractDataArray(response);
      setPromotions(livePromos);
      setTotalPromotions(response?.data?.total || response?.total || 0);
    } catch (err) {
      console.warn('[Promotions] Failed to fetch promotions:', err);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPromotions();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };
      if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
      if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt).toISOString();
      
      await adminApi.createPromotion(payload);
      setIsAddModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      console.error('Failed to create promotion:', err);
      const errorMsg = err?.message || err?.error?.message;
      alert(Array.isArray(errorMsg) ? errorMsg.join('\\n') : errorMsg || 'Failed to create promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoId) return;
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };
      if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
      if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt).toISOString();

      await adminApi.updatePromotion(selectedPromoId, payload);
      setIsEditModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      console.error('Failed to update promotion:', err);
      const errorMsg = err?.message || err?.error?.message;
      alert(Array.isArray(errorMsg) ? errorMsg.join('\\n') : errorMsg || 'Failed to update promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromo = async () => {
    if (!selectedPromoId) return;
    setIsSubmitting(true);
    try {
      await adminApi.deletePromotion(selectedPromoId);
      setIsDeleteModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      console.error('Failed to delete promotion:', err);
      alert(err?.response?.data?.message || err?.error?.message || err?.message || 'Failed to delete promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (promo: Promotion) => {
    setSelectedPromoId(promo.id || promo._id || null);
    setFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount,
      maxDiscountAmount: promo.maxDiscountAmount,
      usageLimitTotal: promo.usageLimitTotal,
      usageLimitPerUser: promo.usageLimitPerUser,
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : '',
      expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : '',
      isActive: promo.isActive,
      description: promo.description || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (promo: Promotion) => {
    setSelectedPromoId(promo.id || promo._id || null);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Promotions & Vouchers</h1>
          <p className="text-xs text-slate-400 mt-1">Configure discount vouchers, promo campaigns, and minimum purchase thresholds</p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              code: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: 0, maxDiscountAmount: 0,
              usageLimitTotal: 0, usageLimitPerUser: 1, startDate: '', expiresAt: '', isActive: true, description: ''
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <input 
          type="text" 
          placeholder="Search by coupon code or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
        />
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {promotions.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs">
          {loading ? 'Fetching promotions...' : 'No promotions found.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {promotions.map((promo) => {
            const isLive = promo.isActive && new Date(promo.startDate) <= new Date() && new Date(promo.expiresAt) >= new Date();
            return (
              <Card key={promo.id || promo._id} className="space-y-3 relative overflow-hidden group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(promo)} className="p-1 text-slate-400 hover:text-emerald-400"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => openDeleteModal(promo)} className="p-1 text-slate-400 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-sm font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded">
                    {promo.code}
                  </span>
                  <Badge status={isLive ? 'active' : 'inactive'}>{isLive ? 'Active Campaign' : 'Inactive/Expired'}</Badge>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% Off` : `₦${promo.discountValue} Off`}
                </h3>
                <p className="text-xs text-slate-400">
                  {promo.description || 'No description provided.'}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>Used: {promo.usedCount} / {promo.usageLimitTotal === 0 ? '∞' : promo.usageLimitTotal}</span>
                  <span>Expires: {new Date(promo.expiresAt).toLocaleDateString()}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPromotions > limit && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            Showing <span className="font-medium text-slate-200">{(page - 1) * limit + 1}</span> to <span className="font-medium text-slate-200">{Math.min(page * limit, totalPromotions)}</span> of <span className="font-medium text-slate-200">{totalPromotions}</span> promotions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= totalPromotions || loading}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Promotion">
        <form onSubmit={handleCreatePromo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Coupon Code</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100 uppercase" placeholder="SUMMER20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select value={formData.isActive ? 'true' : 'false'} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Discount Type</label>
              <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Discount Value</label>
              <input type="number" required min="0" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Min Order Amount (₦)</label>
              <input type="number" min="0" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Max Discount Cap (₦)</label>
              <input type="number" min="0" value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
              <input type="datetime-local" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Date</label>
              <input type="datetime-local" required value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" rows={2} placeholder="Brief description of the promotion" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">Create Promotion</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Promotion">
        <form onSubmit={handleEditPromo} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Coupon Code</label>
              <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100 uppercase" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select value={formData.isActive ? 'true' : 'false'} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Discount Type</label>
              <select value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Discount Value</label>
              <input type="number" required min="0" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Min Order Amount (₦)</label>
              <input type="number" min="0" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Max Discount Cap (₦)</label>
              <input type="number" min="0" value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
              <input type="datetime-local" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Date</label>
              <input type="datetime-local" required value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Promotion">
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">Are you sure you want to delete this promotion? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100">Cancel</button>
            <button onClick={handleDeletePromo} disabled={isSubmitting} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
