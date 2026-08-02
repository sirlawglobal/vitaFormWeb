'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Users, UserPlus, Search, Shield, Filter, Mail, Phone, Loader2 } from 'lucide-react';
import { formatDate, extractDataArray } from '@/lib/utils';
import { UserAccount } from '@/types';
import { adminApi } from '@/lib/api';

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'admin' });

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [changeRoleUserId, setChangeRoleUserId] = useState<string | null>(null);
  const [changeRoleValue, setChangeRoleValue] = useState('customer');

  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data: any = await adminApi.getUsers();
      const liveUsers = extractDataArray(data);
      setUsers(liveUsers);
    } catch (err) {
      console.warn('[Users] Failed to fetch live users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      setIsProvisionModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to provision user:', err);
      alert(err?.error?.message || err?.message || 'Failed to provision user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId) return;
    setIsSubmitting(true);
    try {
      await adminApi.resetUserPassword(resetUserId, resetPasswordValue);
      setIsResetPasswordModalOpen(false);
      setResetPasswordValue('');
      setResetUserId(null);
      alert('Password reset successfully');
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      alert(err?.error?.message || err?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeRoleUserId) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateUserRole(changeRoleUserId, changeRoleValue);
      setIsChangeRoleModalOpen(false);
      setChangeRoleUserId(null);
      setChangeRoleValue('customer');
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to change role:', err);
      alert(err?.error?.message || err?.message || 'Failed to change role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteUserId) return;
    setIsSubmitting(true);
    try {
      await adminApi.deleteUser(deleteUserId);
      setIsDeleteUserModalOpen(false);
      setDeleteUserId(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err?.error?.message || err?.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${(u as any).firstName || ''} ${(u as any).lastName || ''}`.trim();
    const nameStr = u.name || (u as any).fullName || (u as any).username || fullName || '';
    const emailStr = u.email || '';
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailStr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">User & Staff Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision staff user accounts, manage role permissions (`admin`, `support`, `dealer`, `customer`), and monitor active access
          </p>
        </div>
        <button
          onClick={() => setIsProvisionModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
        >
          <UserPlus className="h-4 w-4" />
          <span>Provision User Account</span>
        </button>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'admin', 'support', 'dealer', 'customer'].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider transition-all ${
              roleFilter === role
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {role === 'all' ? 'All Roles' : role}
          </button>
        ))}
      </div>

      {/* Datatable */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Provisioned Date</th>
                <th className="py-3.5 px-4 text-right">RBAC Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    {loading ? 'Fetching user accounts...' : 'No users found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id || (user as any)._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 uppercase">
                            {user.name ? user.name.charAt(0) : ((user as any).firstName ? (user as any).firstName.charAt(0) : 'U')}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-200">
                              {user.name || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'Unknown User'}
                            </div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-500" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-mono uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">
                      <Shield className="h-3 w-3 text-emerald-400" />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={user.isActive ? 'active' : 'inactive'}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{formatDate(user.createdAt)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setResetUserId(user.id || (user as any)._id);
                          setResetPasswordValue('');
                          setIsResetPasswordModalOpen(true);
                        }}
                        className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-slate-800"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => {
                          setChangeRoleUserId(user.id || (user as any)._id);
                          setChangeRoleValue(user.role);
                          setIsChangeRoleModalOpen(true);
                        }}
                        className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-slate-800"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => {
                          setDeleteUserId(user.id || (user as any)._id);
                          setIsDeleteUserModalOpen(true);
                        }}
                        className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-slate-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Provision Staff Modal */}
      <Modal isOpen={isProvisionModalOpen} onClose={() => setIsProvisionModalOpen(false)} title="Provision Staff User Account">
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Oluwaseun"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Adeleke"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Official Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="o.adeleke@vitafoam.com"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+2348012345678"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Temporary Password</label>
            <input
              type="text"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Must be at least 8 characters"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Assigned Security Role</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="admin">Administrator (Full System Access)</option>
              <option value="support">Support Agent (Orders & Support Chat)</option>
              <option value="dealer">Authorized Dealer Representative</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsProvisionModalOpen(false)}
              className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Provision Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} title="Reset Staff Password">
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">New Password</label>
            <input
              type="text"
              required
              minLength={8}
              value={resetPasswordValue}
              onChange={(e) => setResetPasswordValue(e.target.value)}
              placeholder="Must be at least 8 characters"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset Password
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Role Modal */}
      <Modal isOpen={isChangeRoleModalOpen} onClose={() => setIsChangeRoleModalOpen(false)} title="Change User Role">
        <form onSubmit={handleChangeRoleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select New Role</label>
            <select
              value={changeRoleValue}
              onChange={(e) => setChangeRoleValue(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="admin">Administrator</option>
              <option value="support">Support Agent</option>
              <option value="dealer">Authorized Dealer</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsChangeRoleModalOpen(false)}
              className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Role
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal isOpen={isDeleteUserModalOpen} onClose={() => setIsDeleteUserModalOpen(false)} title="Confirm Deletion">
        <form onSubmit={handleDeleteUserSubmit} className="space-y-4 text-xs">
          <div>
            <p className="text-slate-300">Are you sure you want to permanently delete this user? This action cannot be undone.</p>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsDeleteUserModalOpen(false)}
              className="rounded-lg border border-slate-800 px-4 py-2 text-slate-400 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-400 disabled:opacity-50">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
