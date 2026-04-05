const BASE = '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    if (!path.includes('/auth/')) window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Products
  getProducts: (params = {}) => request(`/products?${new URLSearchParams(params)}`),
  getFeatured: () => request('/products/featured'),
  getProduct: (slug) => request(`/products/${slug}`),
  getCategories: () => request('/categories'),

  // Cart
  getCart: () => request('/cart/'),
  addToCart: (data) => request('/cart/', { method: 'POST', body: JSON.stringify(data) }),
  updateCartItem: (id, data) => request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeCartItem: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => request('/cart/', { method: 'DELETE' }),

  // Orders
  checkout: (data) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request('/orders/'),
  getOrder: (id) => request(`/orders/${id}`),

  // Admin
  adminStats: () => request('/admin/stats'),
  adminOrders: (status) => request(`/admin/orders${status ? `?status=${status}` : ''}`),
  adminUsers: () => request('/admin/users'),
  adminCreateProduct: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  adminUpdateOrderStatus: (id, data) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  adminCreateCategory: (data) => request('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
}
