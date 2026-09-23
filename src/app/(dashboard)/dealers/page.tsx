'use client';

import { extractDataArray } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Building2, Plus, MapPin, Phone, Mail, Clock, Edit } from 'lucide-react';
import { Dealer } from '@/types';
import { adminApi } from '@/lib/api';

const EMPTY_FORM = {
  name: '',
  address: '',
  city: '',
  state: '',
  lat: '',
  lng: '',
  contactPhone: '',
  contactEmail: '',
  operatingHours: '',
};

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

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

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedDealerId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dealer: Dealer) => {
    setIsEditing(true);
    setSelectedDealerId(dealer._id);
    const [lng, lat] = dealer.location?.coordinates ?? [undefined, undefined];
    setFormData({
      name: dealer.name ?? '',
      address: dealer.address ?? '',
      city: dealer.city ?? '',
      state: dealer.state ?? '',
      lat: lat !== undefined ? String(lat) : '',
      lng: lng !== undefined ? String(lng) : '',
      contactPhone: dealer.contactPhone ?? '',
      contactEmail: dealer.contactEmail ?? '',
      operatingHours: dealer.operatingHours ?? '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setFormError('Latitude must be a number between -90 and 90.');
      return;
    }
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      setFormError('Longitude must be a number between -180 and 180.');
      return;
    }

    const payload = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      lat,
      lng,
      contactPhone: formData.contactPhone || undefined,
      contactEmail: formData.contactEmail || undefined,
      operatingHours: formData.operatingHours || undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && selectedDealerId) {
        await adminApi.updateDealer(selectedDealerId, payload);
      } else {
        await adminApi.createDealer(payload);
      }
      setIsModalOpen(false);
      fetchDealers();
    } catch (err: any) {
      console.error('Failed to save dealer:', err);
      const errorMsg = err?.error?.message || err?.message || 'Failed to save dealer';
      setFormError(Array.isArray(errorMsg) ? errorMsg.join(' ') : errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Dealer Locations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Onboard and manage the Vitafoam store locations shown on the public dealer locator
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Dealer</span>
        </button>
      </div>

      {dealers.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs">
          {loading ? 'Fetching dealers...' : 'No dealers onboarded yet. Click "Add Dealer" to create the first one.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dealers.map((dealer) => (
            <Card key={dealer._id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-emerald-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{dealer.name}</h3>
                    <span className="text-[11px] text-slate-400">{dealer.city}, {dealer.state}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={dealer.isActive ? 'active' : 'inactive'}>
                    {dealer.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <button
                    onClick={() => openEditModal(dealer)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>{dealer.address}</span>
                </div>
                {dealer.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span>{dealer.contactPhone}</span>
                  </div>
                )}
                {dealer.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span>{dealer.contactEmail}</span>
                  </div>
                )}
                {dealer.operatingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{dealer.operatingHours}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Dealer' : 'Add Dealer'}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-300">{formError}</div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Dealer / Store Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
              placeholder="Vitafoam Comfort Center - Ikeja"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
              placeholder="131 Awolowo Way"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
                placeholder="Ikeja"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
                placeholder="Lagos"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Latitude</label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
                placeholder="6.6018"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Longitude</label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
                placeholder="3.3515"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 -mt-2">
            Tip: right-click a spot on Google Maps and select the coordinates to copy them.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Contact Phone (optional)</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
              placeholder="+234 800 000 0001"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Contact Email (optional)</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
              placeholder="ikeja@vitafoam.com.ng"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Operating Hours (optional)</label>
            <input
              type="text"
              value={formData.operatingHours}
              onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100"
              placeholder="Mon - Sat: 9am - 6pm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Dealer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
