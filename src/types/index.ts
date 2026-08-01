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
  id: string;
  title: string;
  sku: string;
  price: number;
  stockQuantity: number;
  category: string;
  status: 'active' | 'draft' | 'archived';
  imageUrl?: string;
  updatedAt: string;
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
  id: string;
  productTitle: string;
  sku: string;
  stockLevel: number;
  threshold: number;
  warehouseLocation: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
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
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetUrl?: string;
  isActive: boolean;
  displayOrder: number;
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
