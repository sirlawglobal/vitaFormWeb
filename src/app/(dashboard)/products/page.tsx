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
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data: any = await adminApi.getProducts();
      const liveProds = extractDataArray(data);
      setProducts(liveProds);
    } catch (err) {
      console.warn('[Products] Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
            <span className="text-xs text-slate-400 font-medium">Showing {filteredProducts.length} items</span>
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
                  // Inventory is a separate service, default to 0 for now until inventory is integrated
                  const stock = product.stockQuantity ?? product.stock ?? 0;
                  const isActive = product.isActive !== undefined ? product.isActive : true;

                  return (
                    <tr key={product._id || product.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                            <Package className="h-4 w-4" />
                          </div>
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
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors">
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
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Vitafoam Product">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsAddModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-slate-300 font-medium mb-1">Product Title</label>
            <input
              type="text"
              required
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
                placeholder="VF-SUP-005"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Price (NGN)</label>
              <input
                type="number"
                required
                placeholder="250000"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none">
                <option>Orthopaedic Mattresses</option>
                <option>Spring Mattresses</option>
                <option>Pillows & Cushions</option>
                <option>Bedding Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial Stock Quantity</label>
              <input
                type="number"
                required
                placeholder="50"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400">
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
