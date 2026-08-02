export interface DashboardOverview {
  totalUsers: number;
  totalRevenue: number;
  lowStockCount: number;
  pendingOrders: number;
  activePromotionsCount?: number;
  recentSales?: { date: string; revenue: number; orders: number }[];
  categoryDistribution?: { category: string; count: number; percentage: number }[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'support' | 'dealer';
  isActive: boolean;
  createdAt: string;
}

export interface ProductItem {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  sku?: string;
  price?: number;
  stockQuantity?: number;
  category?: string;
  categorySlug?: string;
  status?: 'active' | 'draft' | 'archived';
  isActive?: boolean;
  imageUrl?: string;
  updatedAt?: string;
  createdAt?: string;
  variants?: any[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  isActive: boolean;
}

export interface InventoryItem {
  id?: string;
  _id?: string;
  productId?: { _id: string; name: string };
  productTitle?: string;
  sku: string;
  quantity?: number;
  available?: number;
  reserved?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  warehouse?: string;
  
  stockLevel?: number;
  threshold?: number;
  warehouseLocation?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  itemCount: number;
  createdAt: string;
}

export interface PromoBanner {
  id: string;
  title?: string;
  bannerType?: 'custom' | 'image_only';
  subtitle?: string;
  imageUrl: string;
  targetUrl?: string;
  isActive: boolean;
  displayOrder: number;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  createdAt: string;
}

export interface DealerPartner {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  verified: boolean;
  assignedRegion: string;
}

export interface SystemAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface PlatformSettings {
  siteName: string;
  supportEmail: string;
  currency: string;
  maintenanceMode: boolean;
  bannerAnnouncement?: string;
  enableGuestCheckout: boolean;
}
