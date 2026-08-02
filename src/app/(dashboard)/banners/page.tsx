'use client';

import { extractDataArray } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Image as ImageIcon, Plus, Edit, Trash2, ExternalLink, MoveUp, MoveDown, Loader2, Upload } from 'lucide-react';
import { PromoBanner } from '@/types';
import { adminApi } from '@/lib/api';

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
      await adminApi.createBanner({ ...formData, displayOrder: Number(formData.displayOrder), isActive: true });
      setIsAddModalOpen(false);
      setFormData({ title: '', subtitle: '', imageUrl: '', targetUrl: '', displayOrder: 1 });
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
      await adminApi.updateBanner(selectedBannerId, { ...formData, displayOrder: Number(formData.displayOrder) });
      setIsEditModalOpen(false);
      setSelectedBannerId(null);
      setFormData({ title: '', subtitle: '', imageUrl: '', targetUrl: '', displayOrder: 1 });
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
            setFormData({ title: '', subtitle: '', imageUrl: '', targetUrl: '', displayOrder: 1 });
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
          <Card key={banner.id} className="p-0 overflow-hidden border-slate-800 hover:border-slate-700 transition-all group">
            <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <Badge status={banner.isActive ? 'active' : 'inactive'}>
                    {banner.isActive ? 'Active Slide' : 'Disabled'}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold bg-slate-900/90 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                    Order #{banner.displayOrder}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-2">{banner.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-1">{banner.subtitle}</p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs bg-slate-900/60">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                <span>{banner.targetUrl}</span>
              </div>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Add Banner Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Homepage Promotional Banner">
        <form
          onSubmit={handleCreateBanner}
          className="space-y-4 text-xs"
        >
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
      </Modal>

      {/* Edit Banner Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Promotional Banner">
        <form onSubmit={handleEditBanner} className="space-y-4 text-xs">
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
