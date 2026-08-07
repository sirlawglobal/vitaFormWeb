'use client';

import React, { useState, useEffect } from 'react';
import { CatalogTabs } from '@/components/layout/CatalogTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Plus, Search, Filter, Edit, Trash2, Package, Tag, DollarSign, Layers, Loader2 } from 'lucide-react';
import { formatCurrency, extractDataArray, formatDate } from '@/lib/utils';
import { ProductItem } from '@/types';
import { adminApi } from '@/lib/api';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    price: '',
    categoryId: '',
    initialStock: ''
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    sku: '',
    price: '',
    categoryId: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async (currentPage = page, currentLimit = limit, search = searchTerm) => {
    setLoading(true);
    try {
      const [prodData, catData, invData]: any = await Promise.all([
        adminApi.getProducts({ page: currentPage, limit: currentLimit, search }),
        adminApi.getCategories(),
        adminApi.getInventory({ limit: 1000 })
      ]);
      const rawProducts = extractDataArray(prodData);
      const total = prodData?.data?.total ?? prodData?.total ?? rawProducts.length;
      const invArray = extractDataArray(invData);

      // Join inventory stock levels to the product data
      const productsWithInventory = rawProducts.map((p: any) => {
        const primarySku = p.variants && p.variants.length > 0 ? p.variants[0].sku : p.sku;
        const inv = invArray.find((i: any) => 
          i.productId?._id === (p._id || p.id) || 
          i.productId === (p._id || p.id) ||
          i.sku === primarySku
        );
        return {
          ...p,
          stock: inv ? inv.quantity : 0
        };
      });

      setProducts(productsWithInventory);
      setTotalItems(total);
      setCategories(extractDataArray(catData));
    } catch (err) {
      console.warn('[Products] Failed to fetch data:', err);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, limit, searchTerm);
  }, [page, limit]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const productPayload = {
        name: formData.title,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: formData.title,
        categoryId: formData.categoryId,
        variants: [{
          sku: formData.sku,
          name: formData.title,
          price: Number(formData.price)
        }],
        isActive: true,
        images: [] as { url: string; isPrimary: boolean }[]
      };

      if (selectedFile) {
        const uploadRes = await adminApi.uploadFile(selectedFile, 'products');
        if (uploadRes.url || uploadRes.data?.url) {
          productPayload.images.push({
            url: uploadRes.url || uploadRes.data?.url,
            isPrimary: true
          });
        }
      }
      
      const newProduct = await adminApi.createProduct(productPayload);
      const productId = newProduct.data?._id || newProduct._id;
      
      // Always initialize inventory tracking for the new product
      await adminApi.adjustInventory({
        sku: formData.sku,
        productId: productId,
        quantityChange: Number(formData.initialStock || 0)
      });
      
      setIsAddModalOpen(false);
      setFormData({ title: '', sku: '', price: '', categoryId: '', initialStock: '' });
      setSelectedFile(null);
      fetchData();
    } catch (err: any) {
      console.error('Failed to create product:', err);
      alert(err?.error?.message || err?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (product: any) => {
    const primaryVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    setEditFormData({
      id: product._id || product.id,
      title: product.name || product.title || '',
      sku: primaryVariant?.sku || product.sku || '',
      price: primaryVariant?.price || product.price || '',
      categoryId: product.categoryId?._id || product.categoryId || '',
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setEditSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: editFormData.title,
        categoryId: editFormData.categoryId,
        variants: [{
          sku: editFormData.sku,
          name: editFormData.title,
          price: Number(editFormData.price)
        }],
        isActive: editFormData.isActive,
        images: undefined as any[] | undefined
      };

      if (editSelectedFile) {
        const uploadRes = await adminApi.uploadFile(editSelectedFile, 'products');
        if (uploadRes.url || uploadRes.data?.url) {
          payload.images = [{
            url: uploadRes.url || uploadRes.data?.url,
            isPrimary: true
          }];
        }
      }
      
      await adminApi.updateProduct(editFormData.id, payload);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Failed to update product:', err);
      alert(err?.error?.message || err?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await adminApi.deleteProduct(id);
      fetchData();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      alert(err?.error?.message || err?.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(
    (p: any) => {
      const titleStr = p.name || p.title || '';
      const primaryVariant = p.variants && p.variants.length > 0 ? p.variants[0] : null;
      const skuStr = primaryVariant?.sku || p.sku || '';
      const catStr = p.categorySlug || p.category || '';
      return titleStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skuStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catStr.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );

  return (
    <div className="space-y-6">
      {/* Header & Catalog Sub-tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Catalog Management</h1>
            <p className="text-xs text-slate-400 mt-1">Manage Vitafoam product listings, prices, and stock statuses</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Top Sub-Tab Navigation Bar */}
        <CatalogTabs />
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title or SKU..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-700">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>All Categories</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">Showing {products.length} items (Total {totalItems.toLocaleString()})</span>
          </div>
        </div>
      </Card>

      {/* Products Datatable */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Fetching catalog products...' : 'No products found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: any) => {
                  const primaryVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                  const displayTitle = product.name || product.title || 'Unnamed Product';
                  const displaySku = primaryVariant?.sku || product.sku || 'N/A';
                  const displayCat = product.categorySlug || product.category || 'General';
                  const displayPrice = primaryVariant?.price || product.price || 0;
                  // Map the joined stock value
                  const stock = product.stock ?? 0;
                  const isActive = product.isActive !== undefined ? product.isActive : true;

                  return (
                    <tr key={product._id || product.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0].url} 
                              alt={displayTitle} 
                              className="h-9 w-9 rounded-lg object-cover border border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <span className="block">{displayTitle}</span>
                            <span className="text-[10px] text-slate-400">Updated {formatDate(product.updatedAt || product.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{displaySku}</td>
                      <td className="py-3.5 px-4 text-slate-300">{displayCat}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-400">{formatCurrency(displayPrice)}</td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={stock <= 5 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          {stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={!isActive ? 'inactive' : (stock === 0 ? 'out_of_stock' : product.status || 'active')}>
                          {!isActive ? 'Inactive' : (stock === 0 ? 'Out of Stock' : product.status || 'Active')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(product)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id || product.id, displayTitle)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-800 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Showing <strong className="text-slate-200">{(page - 1) * limit + 1}</strong> to{' '}
              <strong className="text-slate-200">{Math.min(page * limit, totalItems)}</strong> of{' '}
              <strong className="text-slate-200">{totalItems.toLocaleString()}</strong> items
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[10px]">Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              Previous
            </button>
            
            <span className="px-2 text-slate-400 text-xs font-medium">
              Page <strong className="text-emerald-400">{page}</strong> of <strong className="text-slate-200">{Math.ceil(totalItems / limit) || 1}</strong>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(Math.ceil(totalItems / limit) || 1, p + 1))}
              disabled={page >= Math.ceil(totalItems / limit)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              Next
            </button>
            <button
              onClick={() => setPage(Math.ceil(totalItems / limit) || 1)}
              disabled={page >= Math.ceil(totalItems / limit)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
            >
              Last
            </button>
          </div>
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Vitafoam Product">
        <form
          onSubmit={handleCreateProduct}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-slate-300 font-medium mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Vitafoam Supreme Mattress 6x6"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="VF-SUP-005"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Price (NGN)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="250000"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select 
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select a category...</option>
                {categories.map((cat: any) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                placeholder="50"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-500/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-400 hover:file:bg-emerald-500/20 focus:outline-none"
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Product">
        <form
          onSubmit={handleUpdateProduct}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-slate-300 font-medium mb-1">Product Title</label>
            <input
              type="text"
              required
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={editFormData.sku}
                onChange={(e) => setEditFormData({ ...editFormData, sku: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Price (NGN)</label>
              <input
                type="number"
                required
                min="0"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select 
                required
                value={editFormData.categoryId}
                onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select a category...</option>
                {categories.map((cat: any) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isProductActive"
                checked={editFormData.isActive}
                onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="isProductActive" className="text-slate-300 font-medium">Product is Active</label>
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Update Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditSelectedFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-500/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-400 hover:file:bg-emerald-500/20 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">Leave empty to keep current image</p>
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
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
