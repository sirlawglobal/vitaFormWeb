'use client';

import React, { useState, useEffect } from 'react';
import { SalesTabs } from '@/components/layout/SalesTabs';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, Eye, Truck, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, extractDataArray, formatDate } from '@/lib/utils';
import { CustomerOrder } from '@/types';
import { adminApi } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data: any = await adminApi.getOrders();
      const liveOrders = extractDataArray(data);
      setOrders(liveOrders);
    } catch (err) {
      console.warn('[Orders] Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus });
      setOrders((prev) =>
        prev.map((o: any) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Customer Orders & Fulfillment</h1>
            <p className="text-xs text-slate-400 mt-1">Track store orders, payment status, and order dispatch state transitions</p>
          </div>
        </div>

        {/* Sales Sub-tabs Switcher */}
        <SalesTabs />
      </div>

      {/* Orders Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Fetching orders...' : 'No orders recorded.'}
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{order.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="block font-semibold text-slate-200">
                        {order.userId ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}` : 'Customer'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {order.userId?.email || order.shippingAddress?.email || ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">{order.items?.length || 0} items</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{formatCurrency(order.paymentSummary?.totalAmount || 0)}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={order.paymentSummary?.paymentStatus || 'PENDING'}>
                        {order.paymentSummary?.paymentStatus || 'PENDING'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.orderStatus || 'PENDING'}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs rounded px-2.5 py-1 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer disabled:opacity-50"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Order Ref: ${order.orderNumber}\nCustomer: ${order.shippingAddress?.email || 'N/A'}\nTotal: ₦${order.paymentSummary?.totalAmount?.toLocaleString() || 0}`)}
                        className="rounded-md border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
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
