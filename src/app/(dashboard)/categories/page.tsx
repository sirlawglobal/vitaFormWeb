'use client';

import { extractDataArray } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { CatalogTabs } from '@/components/layout/CatalogTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tags, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { ProductCategory } from '@/types';
import { adminApi } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data: any = await adminApi.getCategories();
      const liveCategories: any[] = extractDataArray(data);
      
      const mappedCats: ProductCategory[] = liveCategories.map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name || 'Unnamed Category',
        slug: cat.slug || 'unknown',
        description: cat.description || `${cat.name || 'Category'} product line`,
        productCount: 0, // Not provided directly by the category list endpoint
        isActive: cat.isActive !== undefined ? cat.isActive : true,
      }));
      
      setCategories(mappedCats);
    } catch (err) {
      console.warn('[Categories] Failed to fetch categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: formData.description,
        isActive: true
      };
      await adminApi.createCategory(payload);
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to create category:', err);
      alert(err?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      alert(err?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Category Taxonomy</h1>
            <p className="text-xs text-slate-400 mt-1">Organize products into hierarchical categories for mobile app and web catalog</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Category</span>
          </button>
        </div>

        {/* Catalog Sub-tabs Switcher */}
        <CatalogTabs />
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs">
          {loading ? 'Fetching categories...' : 'No product categories found.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <Card key={cat.id || cat.slug} className="relative overflow-hidden border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-emerald-400">
                    <Tags className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{cat.name}</h3>
                    <span className="text-[11px] font-mono text-slate-500">/{cat.slug}</span>
                  </div>
                </div>
                <Badge status={cat.isActive ? 'active' : 'inactive'}>
                  {cat.isActive ? 'Active' : 'Disabled'}
                </Badge>
              </div>

              <p className="mt-3 text-xs text-slate-400">{cat.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Product Count: <strong className="text-slate-200">Dynamic</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:text-emerald-400">
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id || (cat as any)._id, cat.name)}
                    className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:text-rose-400 hover:border-rose-900 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Category Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Memory Foam Mattresses"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of this category..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none min-h-[80px]"
            />
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
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
