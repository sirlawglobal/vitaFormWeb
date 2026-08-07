'use client';

import { extractDataArray } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { CatalogTabs } from '@/components/layout/CatalogTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Boxes, AlertTriangle, CheckCircle2, RefreshCw, Search, Filter, Loader2, Package } from 'lucide-react';
import { InventoryItem } from '@/types';
import { adminApi } from '@/lib/api';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'healthy' | 'low' | 'out'>('all');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Restock Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<any>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<string>('50');
  const [restockReason, setRestockReason] = useState<string>('Factory Restock Intake');
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data: any = await adminApi.getInventory();
      const liveItems = extractDataArray(data);
      setInventory(liveItems);
    } catch (err) {
      console.warn('[Inventory] Failed to fetch inventory:', err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenRestock = (item: any) => {
    setSelectedRestockItem(item);
    setQuantityToAdd('50');
    setRestockReason('Factory Restock Intake');
    setIsRestockModalOpen(true);
  };

  const getCleanMongoId = (idVal: any): string | undefined => {
    if (!idVal) return undefined;
    if (typeof idVal === 'string' && /^[0-9a-fA-F]{24}$/.test(idVal)) return idVal;
    if (typeof idVal === 'object') {
      const candidate = idVal._id || idVal.id;
      if (typeof candidate === 'string' && /^[0-9a-fA-F]{24}$/.test(candidate)) return candidate;
    }
    return undefined;
  };

  const handleConfirmRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockItem || !quantityToAdd) return;

    setIsSubmittingRestock(true);
    try {
      const targetProductId = getCleanMongoId(selectedRestockItem.productId) || getCleanMongoId(selectedRestockItem);

      const payload: any = {
        sku: selectedRestockItem.sku,
        quantityChange: Number(quantityToAdd),
        reason: restockReason
      };

      if (targetProductId) {
        payload.productId = targetProductId;
      }

      await adminApi.adjustInventory(payload);

      setIsRestockModalOpen(false);
      setSelectedRestockItem(null);
      fetchInventory();
    } catch (err: any) {
      console.error('Failed to restock inventory:', err);
      const validationErrors = err?.error?.details?.errors || err?.details?.errors;
      let msg = 'Failed to restock inventory item';
      
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        msg = validationErrors
          .map((e: any) => e.constraints ? Object.values(e.constraints).join(', ') : e.message || 'Validation error')
          .join(' | ');
      } else if (Array.isArray(err?.error?.message)) {
        msg = err.error.message.join(', ');
      } else if (Array.isArray(err?.message)) {
        msg = err.message.join(', ');
      } else if (typeof err?.error?.message === 'string') {
        msg = err.error.message;
      } else if (typeof err?.message === 'string') {
        msg = err.message;
      }

      alert(msg);
    } finally {
      setIsSubmittingRestock(false);
    }
  };

  // Summary status counts
  const healthyCount = inventory.filter(i => {
    const available = i.available ?? i.quantity ?? (i as any).stockLevel ?? 0;
    const threshold = i.reorderPoint ?? (i as any).threshold ?? 0;
    return (i as any).status === 'in_stock' || available > threshold;
  }).length;

  const lowStockCount = inventory.filter(i => {
    const available = i.available ?? i.quantity ?? (i as any).stockLevel ?? 0;
    const threshold = i.reorderPoint ?? (i as any).threshold ?? 0;
    return (i as any).status === 'low_stock' || (available > 0 && available <= threshold);
  }).length;

  const outOfStockCount = inventory.filter(i => {
    const available = i.available ?? i.quantity ?? (i as any).stockLevel ?? 0;
    return (i as any).status === 'out_of_stock' || available === 0;
  }).length;

  // Filter inventory based on search and status tabs
  const filteredInventory = inventory.filter(item => {
    const qty = item.available ?? item.quantity ?? (item as any).stockLevel ?? 0;
    const threshold = item.reorderPoint ?? (item as any).threshold ?? 10;
    let status = 'in_stock';
    if (qty === 0) status = 'out_of_stock';
    else if (qty <= threshold) status = 'low_stock';

    if (filterStatus === 'healthy' && status !== 'in_stock') return false;
    if (filterStatus === 'low' && status !== 'low_stock') return false;
    if (filterStatus === 'out' && status !== 'out_of_stock') return false;

    if (!searchTerm.trim()) return true;
    const title = (item.productId?.name || (item as any).productTitle || (item as any).name || '').toLowerCase();
    const sku = (item.sku || '').toLowerCase();
    const warehouse = (item.warehouse || (item as any).warehouseLocation || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    return title.includes(query) || sku.includes(query) || warehouse.includes(query);
  });

  // Calculate pagination slice
  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + limit);

  const handleStatusFilterChange = (status: 'all' | 'healthy' | 'low' | 'out') => {
    setFilterStatus(status);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Stock &amp; Inventory Controls</h1>
            <p className="text-xs text-slate-400 mt-1">Monitor stock quantities, set reorder threshold alerts, and manage warehouse locations</p>
          </div>
          <button 
            onClick={fetchInventory}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Audit Stock Counts</span>
          </button>
        </div>

        {/* Catalog Sub-tabs Switcher */}
        <CatalogTabs />
      </div>

      {/* Inventory Alerts Bar (Clickable Filters) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div onClick={() => handleStatusFilterChange(filterStatus === 'healthy' ? 'all' : 'healthy')}>
          <Card 
            className={`cursor-pointer transition-all ${filterStatus === 'healthy' ? 'border-emerald-400 ring-1 ring-emerald-400/50 bg-emerald-950/20' : 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/60'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold uppercase">Healthy Stock</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="mt-2 block text-2xl font-bold text-slate-100">{healthyCount} Items</span>
          </Card>
        </div>
        <div onClick={() => handleStatusFilterChange(filterStatus === 'low' ? 'all' : 'low')}>
          <Card 
            className={`cursor-pointer transition-all ${filterStatus === 'low' ? 'border-amber-400 ring-1 ring-amber-400/50 bg-amber-950/20' : 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/60'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-semibold uppercase">Low Stock Warning</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <span className="mt-2 block text-2xl font-bold text-amber-300">{lowStockCount} Items</span>
          </Card>
        </div>
        <div onClick={() => handleStatusFilterChange(filterStatus === 'out' ? 'all' : 'out')}>
          <Card 
            className={`cursor-pointer transition-all ${filterStatus === 'out' ? 'border-rose-400 ring-1 ring-rose-400/50 bg-rose-950/20' : 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/60'}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-400 font-semibold uppercase">Out of Stock</span>
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>
            <span className="mt-2 block text-2xl font-bold text-rose-400">{outOfStockCount} Items</span>
          </Card>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by product name, SKU, or depot..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filterStatus === 'all'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              All ({inventory.length})
            </button>
            <button
              onClick={() => handleStatusFilterChange('healthy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filterStatus === 'healthy'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              Healthy ({healthyCount})
            </button>
            <button
              onClick={() => handleStatusFilterChange('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filterStatus === 'low'
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              Low ({lowStockCount})
            </button>
            <button
              onClick={() => handleStatusFilterChange('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filterStatus === 'out'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              Out ({outOfStockCount})
            </button>
          </div>
        </div>
      </Card>

      {/* Inventory Datatable */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Item &amp; SKU</th>
                <th className="py-3.5 px-4">Warehouse Depot</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Reorder Threshold</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Loading inventory data...' : 'No inventory items matching criteria.'}
                  </td>
                </tr>
              ) : (
                paginatedInventory.map((item: any) => {
                  const qty = item.available ?? item.quantity ?? item.stockLevel ?? 0;
                  const threshold = item.reorderPoint ?? item.threshold ?? 10;
                  let status = 'in_stock';
                  if (qty === 0) status = 'out_of_stock';
                  else if (qty <= threshold) status = 'low_stock';
                  const title = item.productId?.name || item.productTitle || item.name || `Product SKU: ${item.sku}`;

                  return (
                    <tr key={item.id || item._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        <span className="block">{title}</span>
                        <span className="text-[10px] font-mono text-slate-500">{item.sku || 'N/A'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{item.warehouse || item.warehouseLocation || 'Central Warehouse'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{qty} units</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">Min {threshold} units</td>
                      <td className="py-3.5 px-4">
                        <Badge status={status}>
                          {status === 'in_stock' ? 'In Stock' : status === 'low_stock' ? 'Low Stock Alert' : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => handleOpenRestock(item)}
                          className="rounded-md border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 transition-colors"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
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
                Page <strong className="text-emerald-400">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Restock Inventory Modal */}
      <Modal 
        isOpen={isRestockModalOpen} 
        onClose={() => setIsRestockModalOpen(false)} 
        title="Restock Inventory Quantity"
      >
        {selectedRestockItem && (
          <form onSubmit={handleConfirmRestock} className="space-y-4 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-between">
              <div>
                <span className="block font-semibold text-slate-100">
                  {selectedRestockItem.productId?.name || selectedRestockItem.productTitle || selectedRestockItem.name || 'Vitafoam Product'}
                </span>
                <span className="font-mono text-[10px] text-slate-400">SKU Code: {selectedRestockItem.sku}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Current Stock</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {selectedRestockItem.available ?? selectedRestockItem.quantity ?? 0} units
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Additional Quantity to Intake</label>
              <input
                type="number"
                required
                min="1"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(e.target.value)}
                placeholder="e.g. 50"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Restock Reason / Reference Note</label>
              <input
                type="text"
                required
                value={restockReason}
                onChange={(e) => setRestockReason(e.target.value)}
                placeholder="e.g. Factory Shipment Intake, Batch #402"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isSubmittingRestock}
                onClick={() => setIsRestockModalOpen(false)}
                className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingRestock}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingRestock && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Restock Intake
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
