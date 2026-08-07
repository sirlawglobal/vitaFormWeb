import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Safely extracts an array from various API response structures.
 * Handles nested paginated responses like { data: { items: [...] } } or { items: [...] }
 */
export function extractDataArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.items)) return data.data.items;
  // Fallback for custom plural keys like data.products or data.users
  const fallback = Object.values(data).find(val => Array.isArray(val)) || 
                   (data.data && Object.values(data.data).find(val => Array.isArray(val)));
  return Array.isArray(fallback) ? fallback : [];
}

export function getStatusBadgeColor(status: string): string {
  const lower = status.toLowerCase();
  if (['active', 'completed', 'delivered', 'paid', 'verified', 'success'].includes(lower)) {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }
  if (['pending', 'processing', 'shipped', 'in_progress', 'low_stock'].includes(lower)) {
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }
  if (['inactive', 'cancelled', 'failed', 'out_of_stock', 'rejected'].includes(lower)) {
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  }
  return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
}
