const ENV_API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
const API_BASE = ENV_API_URL ? `${ENV_API_URL}/api` : '/api';

function getHeaders() {
  const token = localStorage.getItem('queueless_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function adminLogin(credentials: any) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
  return data;
}

export async function fetchDashboardData() {
  const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: getHeaders() });
  return res.json();
}

export async function fetchOrders(params: any = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/orders?${query}`, { headers: getHeaders() });
  return res.json();
}

export async function updateOrderStatus(orderId: string, status: string) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function confirmCashPayment(orderId: string) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/cash-confirm`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return res.json();
}

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/admin/products`, { headers: getHeaders() });
  return res.json();
}

export async function createProduct(payload: any) {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateProduct(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/admin/categories`, { headers: getHeaders() });
  return res.json();
}

export async function createCategory(payload: any) {
  const res = await fetch(`${API_BASE}/admin/categories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateCategory(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
}

export async function fetchCounters() {
  const res = await fetch(`${API_BASE}/admin/counters`, { headers: getHeaders() });
  return res.json();
}

export async function fetchStaff() {
  const res = await fetch(`${API_BASE}/admin/staff`, { headers: getHeaders() });
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getHeaders() });
  return res.json();
}

export async function fetchCounterOrders(counterId: string) {
  const res = await fetch(`${API_BASE}/counter/${counterId}/orders`, { headers: getHeaders() });
  return res.json();
}

export async function updateCounterItemStatus(counterId: string, itemId: string, status: string) {
  const res = await fetch(`${API_BASE}/counter/${counterId}/items/${itemId}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}
