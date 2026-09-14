const ENV_API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');
const API_BASE = ENV_API_URL ? `${ENV_API_URL}/api` : '/api';

export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

export async function fetchShopMenu(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/public/shops/${slug}/menu`);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 404) {
        throw new ApiError(data?.error || 'Shop not found', 404);
      }
      throw new ApiError(data?.error || `Server error (${res.status})`, res.status);
    }

    if (!data || !data.success) {
      throw new ApiError(data?.error || 'Failed to fetch menu');
    }

    return data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unable to connect to the QueueLess API server. Please check if the API is running.', undefined, true);
  }
}

export async function createCustomerOrder(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/public/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new ApiError(data?.error || 'Failed to place order', res.status);
    }
    return data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unable to connect to the QueueLess API server.', undefined, true);
  }
}

export async function fetchOrderDetails(orderRef: string) {
  try {
    const res = await fetch(`${API_BASE}/public/orders/${orderRef}`);
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new ApiError(data?.error || 'Failed to fetch order', res.status);
    }
    return data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unable to connect to the QueueLess API server.', undefined, true);
  }
}
