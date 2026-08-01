'use client';

import { extractDataArray } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { CatalogTabs } from '@/components/layout/CatalogTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Boxes, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { InventoryItem } from '@/types';
import { adminApi } from '@/lib/api';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

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

  const healthyCount = inventory.filter(i => i.status === 'in_stock' || (i.stockLevel > (i.threshold || 0))).length;
  const lowStockCount = inventory.filter(i => i.status === 'low_stock' || (i.stockLevel > 0 && i.stockLevel <= (i.threshold || 0))).length;
  const outOfStockCount = inventory.filter(i => i.status === 'out_of_stock' || i.stockLevel === 0).length;

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Stock & Inventory Controls</h1>
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

      {/* Inventory Alerts Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold uppercase">Healthy Stock</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="mt-2 block text-2xl font-bold text-slate-100">{healthyCount} Items</span>
        </Card>
        <Card className="border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-semibold uppercase">Low Stock Warning</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <span className="mt-2 block text-2xl font-bold text-amber-300">{lowStockCount} Items</span>
        </Card>
        <Card className="border-rose-500/30 bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-semibold uppercase">Out of Stock</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <span className="mt-2 block text-2xl font-bold text-rose-400">{outOfStockCount} Items</span>
        </Card>
      </div>

      {/* Inventory Datatable */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Item & SKU</th>
                <th className="py-3.5 px-4">Warehouse Depot</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Reorder Threshold</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Loading inventory data...' : 'No inventory items registered.'}
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id || (item as any)._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <span className="block">{item.productTitle || (item as any).name || 'Unnamed Product'}</span>
                      <span className="text-[10px] font-mono text-slate-500">{item.sku || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{item.warehouseLocation || 'Central Warehouse'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{item.stockLevel ?? (item as any).quantity ?? 0} units</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">Min {item.threshold ?? 10} units</td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.status || 'in_stock'}>
                        {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock Alert' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-slate-800">
                        Restock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
