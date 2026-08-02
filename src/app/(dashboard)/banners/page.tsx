'use client';

import { extractDataArray } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Image as ImageIcon, Plus, Edit, Trash2, ExternalLink, MoveUp, MoveDown, Loader2, Upload } from 'lucide-react';
import { PromoBanner } from '@/types';
import { adminApi } from '@/lib/api';

const BannerPreviewCard = ({ banner, actions }: { banner: Partial<PromoBanner>; actions?: React.ReactNode }) => {
  const isScheduled = !!banner.scheduledStartDate && new Date(banner.scheduledStartDate) > new Date();
  const statusBadge = banner.isActive 
    ? (isScheduled ? 'Scheduled' : 'Live') 
    : 'Draft';
  
  return (
    <Card className="p-0 overflow-hidden border-slate-800 hover:border-slate-700 transition-all group">
      <div className="relative h-44 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={banner.title || 'Preview'}
            className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-slate-500 text-xs flex flex-col items-center">
            <ImageIcon className="h-6 w-6 mb-2 opacity-50" />
            No Image Selected
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <Badge status={statusBadge === 'Live' ? 'active' : statusBadge === 'Scheduled' ? 'warning' : 'inactive'}>
              {statusBadge}
            </Badge>
            <span className="text-[10px] font-mono font-bold bg-slate-900/90 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
              Order #{banner.displayOrder || 1}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-2">{banner.title || 'Banner Title'}</h3>
          <p className="text-xs text-slate-300 line-clamp-1">{banner.subtitle || 'Banner Subtitle'}</p>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between text-xs bg-slate-900/60 border-t border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
            <span>{banner.targetUrl || '/destination'}</span>
          </div>
          {(banner.scheduledStartDate || banner.scheduledEndDate) && (
            <div className="text-[10px] text-slate-500 font-mono">
              {banner.scheduledStartDate ? new Date(banner.scheduledStartDate).toLocaleDateString() : 'Now'} 
              {' - '} 
              {banner.scheduledEndDate ? new Date(banner.scheduledEndDate).toLocaleDateString() : 'Forever'}
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </Card>
  );
};

export default function BannersPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    targetUrl: '',
    displayOrder: 1,
    isActive: true,
    scheduledStartDate: '',
    scheduledEndDate: '',
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data: any = await adminApi.getBanners();
      const liveBanners = extractDataArray(data);
      setBanners(liveBanners);
    } catch (err) {
      console.warn('[Banners] Failed to fetch banners:', err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData, displayOrder: Number(formData.displayOrder) };
      if (!payload.scheduledStartDate) delete payload.scheduledStartDate;
      if (!payload.scheduledEndDate) delete payload.scheduledEndDate;
      await adminApi.createBanner(payload);
      setIsAddModalOpen(false);
      setFormData({ title: '', subtitle: '', imageUrl: '', targetUrl: '', displayOrder: 1, isActive: true, scheduledStartDate: '', scheduledEndDate: '' });
      fetchBanners();
    } catch (err: any) {
      console.error('Failed to create banner:', err);
      alert(err?.error?.message || err?.message || 'Failed to create banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBannerId) return;
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData, displayOrder: Number(formData.displayOrder) };
      if (!payload.scheduledStartDate) delete payload.scheduledStartDate;
      if (!payload.scheduledEndDate) delete payload.scheduledEndDate;
      await adminApi.updateBanner(selectedBannerId, payload);
      setIsEditModalOpen(false);
      setSelectedBannerId(null);
      setFormData({ title: '', subtitle: '', imageUrl: '', targetUrl: '', displayOrder: 1, isActive: true, scheduledStartDate: '', scheduledEndDate: '' });
      fetchBanners();
    } catch (err: any) {
      console.error('Failed to update banner:', err);
      alert(err?.error?.message || err?.message || 'Failed to update banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBannerId) return;
    setIsSubmitting(true);
    try {
      await adminApi.deleteBanner(selectedBannerId);
      setIsDeleteModalOpen(false);
      setSelectedBannerId(null);
      fetchBanners();
    } catch (err: any) {
      console.error('Failed to delete banner:', err);
      alert(err?.error?.message || err?.message || 'Failed to delete banner');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await adminApi.uploadFile(file, 'banners');
      if (res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      alert(err?.error?.message || err?.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openEditModal = (banner: PromoBanner) => {
    setSelectedBannerId(banner.id || (banner as any)._id);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl || '',
      targetUrl: banner.targetUrl || '',
      displayOrder: banner.displayOrder || 1,
      isActive: banner.isActive !== false,
      scheduledStartDate: banner.scheduledStartDate ? new Date(banner.scheduledStartDate).toISOString().slice(0, 16) : '',
      scheduledEndDate: banner.scheduledEndDate ? new Date(banner.scheduledEndDate).toISOString().slice(0, 16) : '',
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Promotional Banners</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage mobile app and homepage campaign sliders (`GET`, `POST`, `PATCH`, `DELETE /admin/banners`)
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', subtitle: '', imageUrl: '', targetUrl: '', displayOrder: 1, isActive: true, scheduledStartDate: '', scheduledEndDate: '' });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banners Visual Card Grid */}
      {banners.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs">
          {loading ? 'Fetching promotional banners...' : 'No active promotional banners found. Click "Add New Banner" to create one.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {banners.map((banner) => (
            <div key={banner.id}>
              <BannerPreviewCard 
                banner={banner}
                actions={
                  <>
                    <button 
                      onClick={() => openEditModal(banner)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedBannerId(banner.id || (banner as any)._id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Homepage Promotional Banner">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1 hidden lg:block">
            <h3 className="text-slate-400 font-semibold mb-3 text-xs uppercase tracking-wider">Live Preview</h3>
            <BannerPreviewCard banner={formData} />
          </div>
          <form
            onSubmit={handleCreateBanner}
            className="space-y-4 text-xs order-1 lg:order-2"
          >
            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div>
                <label className="block text-slate-300 font-medium mb-0.5">Banner Status</label>
                <p className="text-[10px] text-slate-500">Live banners are visible (unless scheduled).</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Banner Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. New Year Comfort Promo"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Subtitle / Marketing Message</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Save up to 20% on all orthopaedic series"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Banner Image</label>
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors">
                {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>{isUploadingImage ? 'Uploading...' : 'Upload File'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
              </label>
              <span className="text-slate-500 text-xs">or paste URL below</span>
            </div>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Deep-Link / URL</label>
              <input
                type="text"
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                placeholder="/promotions/new-year"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Display Order</label>
              <input
                type="number"
                required
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Schedule Start (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledStartDate}
                onChange={(e) => setFormData({ ...formData, scheduledStartDate: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Schedule End (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledEndDate}
                onChange={(e) => setFormData({ ...formData, scheduledEndDate: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Banner
            </button>
          </div>
        </form>
        </div>
      </Modal>

      {/* Edit Banner Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Promotional Banner">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1 hidden lg:block">
            <h3 className="text-slate-400 font-semibold mb-3 text-xs uppercase tracking-wider">Live Preview</h3>
            <BannerPreviewCard banner={formData} />
          </div>
          <form onSubmit={handleEditBanner} className="space-y-4 text-xs order-1 lg:order-2">
            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div>
                <label className="block text-slate-300 font-medium mb-0.5">Banner Status</label>
                <p className="text-[10px] text-slate-500">Live banners are visible (unless scheduled).</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Banner Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. New Year Comfort Promo"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Subtitle / Marketing Message</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Save up to 20% on all orthopaedic series"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Banner Image</label>
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors">
                {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>{isUploadingImage ? 'Uploading...' : 'Upload File'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
              </label>
              <span className="text-slate-500 text-xs">or paste URL below</span>
            </div>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Deep-Link / URL</label>
              <input
                type="text"
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                placeholder="/promotions/new-year"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Display Order</label>
              <input
                type="number"
                required
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Schedule Start (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledStartDate}
                onChange={(e) => setFormData({ ...formData, scheduledStartDate: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Schedule End (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledEndDate}
                onChange={(e) => setFormData({ ...formData, scheduledEndDate: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
        </div>
      </Modal>

      {/* Delete Banner Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <form onSubmit={handleDeleteBanner} className="space-y-4 text-xs">
          <div>
            <p className="text-slate-300">Are you sure you want to delete this promotional banner? This action cannot be undone.</p>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-400 disabled:opacity-50">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Banner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
