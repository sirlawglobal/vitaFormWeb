import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error logging & response extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected API error occurred';

    // Handle 401 Unauthorized: clear stale tokens and redirect to login if on client
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // Use console.warn instead of console.error to prevent Next.js dev overlay popups on expected 401s
    console.warn('[API Notice]:', message);
    return Promise.reject(error.response?.data || { message });
  }
);

// Admin API endpoints matching NestJS AdminController & Backend Modules
export const adminApi = {
  // Auth
  login: (credentials: { identifier: string; password: string }): Promise<any> =>
    apiClient.post('/auth/login', credentials),

  // Overview metrics
  getDashboardOverview: (): Promise<any> => apiClient.get('/admin/dashboard'),
  
  // Users & Staff
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string; isActive?: boolean }): Promise<any> =>
    apiClient.get('/admin/users', { params }),
  createUser: (data: { email: string; firstName: string; lastName: string; phone: string; role: string; password?: string }): Promise<any> =>
    apiClient.post('/admin/users', data),
  updateUserRole: (id: string, role: string): Promise<any> =>
    apiClient.patch(`/admin/users/${id}/role`, { role }),
  resetUserPassword: (id: string, password: string): Promise<any> =>
    apiClient.patch(`/admin/users/${id}/reset-password`, { password }),
  deleteUser: (id: string): Promise<any> =>
    apiClient.delete(`/admin/users/${id}`),

  // Banners
  getBanners: (params?: { page?: number; limit?: number; search?: string; bannerType?: string; isActive?: boolean }): Promise<any> => 
    apiClient.get('/admin/banners', { params }),
  getBannerById: (id: string): Promise<any> => apiClient.get(`/admin/banners/${id}`),
  createBanner: (data: any): Promise<any> => apiClient.post('/admin/banners', data),
  updateBanner: (id: string, data: any): Promise<any> => apiClient.patch(`/admin/banners/${id}`, data),
  deleteBanner: (id: string): Promise<any> => apiClient.delete(`/admin/banners/${id}`),

  // Promotions
  getPromotions: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }): Promise<any> => 
    apiClient.get('/promotions', { params }),
  createPromotion: (data: any): Promise<any> => apiClient.post('/promotions', data),
  updatePromotion: (id: string, data: any): Promise<any> => apiClient.patch(`/promotions/${id}`, data),
  deletePromotion: (id: string): Promise<any> => apiClient.delete(`/promotions/${id}`),

  // Articles
  getArticles: (params?: { page?: number; limit?: number; search?: string; isPublished?: boolean }): Promise<any> => 
    apiClient.get('/admin/articles', { params }),
  createArticle: (data: any): Promise<any> => apiClient.post('/admin/articles', data),
  updateArticle: (id: string, data: any): Promise<any> => apiClient.patch(`/admin/articles/${id}`, data),
  publishArticle: (id: string): Promise<any> => apiClient.patch(`/admin/articles/${id}/publish`),
  deleteArticle: (id: string): Promise<any> => apiClient.delete(`/admin/articles/${id}`),

  // Categories
  getCategories: (): Promise<any> => apiClient.get('/categories/admin/all'),
  createCategory: (data: any): Promise<any> => apiClient.post('/categories', data),
  updateCategory: (id: string, data: any): Promise<any> => apiClient.patch(`/categories/${id}`, data),
  deleteCategory: (id: string): Promise<any> => apiClient.delete(`/categories/${id}`),

  // Platform Settings
  getSettings: (): Promise<any> => apiClient.get('/admin/settings'),
  updateSettings: (data: any): Promise<any> => apiClient.patch('/admin/settings', data),

  // Audit Logs
  getAuditLogs: (params?: { page?: number; limit?: number; adminId?: string }): Promise<any> =>
    apiClient.get('/admin/audit-logs', { params }),

  // Products & Catalog
  getProducts: (params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<any> =>
    apiClient.get('/products/admin/all', { params }),
  createProduct: (data: any): Promise<any> => apiClient.post('/products', data),
  updateProduct: (id: string, data: any): Promise<any> => apiClient.patch(`/products/${id}`, data),
  deleteProduct: (id: string): Promise<any> => apiClient.delete(`/products/${id}`),
  
  // Inventory
  getInventory: (params?: { page?: number; limit?: number; lowStockOnly?: boolean }): Promise<any> =>
    apiClient.get('/inventory', { params }),
  getLowStock: (): Promise<any> => apiClient.get('/inventory/low-stock'),
  adjustInventory: (data: any): Promise<any> => apiClient.post('/inventory/adjust', data),

  // Storage & Uploads
  uploadFile: (file: File, folder?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/storage/upload', formData, {
      params: { folder },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Orders
  getOrders: (params?: { page?: number; limit?: number; status?: string }): Promise<any> =>
    apiClient.get('/orders', { params }),

  // Dealers
  getDealers: (params?: { page?: number; limit?: number }): Promise<any> =>
    apiClient.get('/dealers', { params }),

  // Sleep Quiz
  sleepQuiz: {
    // Rules
    getRules: () => apiClient.get('/admin/rules'),
    createRule: (data: any) => apiClient.post('/admin/rules', data),
    updateRule: (id: string, data: any) => apiClient.patch(`/admin/rules/${id}`, data),
    deleteRule: (id: string) => apiClient.delete(`/admin/rules/${id}`),
    // Questions
    getQuestions: () => apiClient.get('/sleep-quiz/questions'),
    createQuestion: (data: any) => apiClient.post('/admin/questions', data),
    updateQuestion: (id: string, data: any) => apiClient.patch(`/admin/questions/${id}`, data),
    deleteQuestion: (id: string) => apiClient.delete(`/admin/questions/${id}`),
  }
};
