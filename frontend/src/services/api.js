import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT to every request ───────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fnb_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ── Redirect to login on 401 ──────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fnb_token');
      localStorage.removeItem('fnb_user');
      window.location.href = '/login';
    }

       if (err.response?.status === 403) {
        console.log('403 intercepted, firing event'); 
      // Fire a custom event — any component can listen
      window.dispatchEvent(new CustomEvent('fnb:forbidden', {
        detail: { message: err.response?.data?.error || 'Access denied.' }
      }));
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const login     = (data)   => api.post('/auth/login', data);
export const getMe     = ()       => api.get('/auth/me');
export const getUsers  = ()       => api.get('/auth/users');
export const createUser = (data)  => api.post('/auth/users', data);
export const deactivateUser = (id) => api.patch(`/auth/users/${id}/deactivate`);
export const activateUser   = (id) => api.patch(`/auth/users/${id}/activate`);

// ── Menu Items ────────────────────────────────────────────────
export const getMenuItems = () => api.get('/menu-items');
export const getMenuItem = (id) => api.get(`/menu-items/${id}`);
export const createMenuItem = (data) => api.post('/menu-items', data);
export const updateMenuItem = (id, data) => api.put(`/menu-items/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu-items/${id}`);

// ── Outlets ───────────────────────────────────────────────────
export const getOutlets = () => api.get('/outlets');
export const getOutlet = (id) => api.get(`/outlets/${id}`);
export const createOutlet = (data) => api.post('/outlets', data);
export const updateOutlet = (id, data) => api.put(`/outlets/${id}`, data);

// ── Outlet Menu Assignment ────────────────────────────────────
export const getOutletMenu = (outletId) => api.get(`/outlets/${outletId}/menu`);
export const assignMenuItem = (outletId, data) => api.post(`/outlets/${outletId}/menu`, data);
export const updateAssignment = (outletId, menuItemId, data) => api.patch(`/outlets/${outletId}/menu/${menuItemId}`, data);
export const removeAssignment = (outletId, menuItemId) => api.delete(`/outlets/${outletId}/menu/${menuItemId}`);

// ── Inventory ─────────────────────────────────────────────────
export const getInventory = (outletId) => api.get(`/inventory/${outletId}`);
export const setStock = (outletId, menuItemId, data) => api.put(`/inventory/${outletId}/${menuItemId}`, data);
export const adjustStock = (outletId, menuItemId, data) => api.patch(`/inventory/${outletId}/${menuItemId}`, data);

// ── Sales ─────────────────────────────────────────────────────
export const createSale = (data) => api.post('/sales', data);
export const getSales = (outletId, params) => api.get(`/sales/${outletId}`, { params });
export const getSaleByReceipt = (outletId, receiptNumber) => api.get(`/sales/${outletId}/${receiptNumber}`);

// ── Reports ───────────────────────────────────────────────────
export const getRevenueReport = (params) => api.get('/reports/revenue', { params });
export const getTopItems = (outletId, params) => api.get(`/reports/top-items/${outletId}`, { params });

export default api;
