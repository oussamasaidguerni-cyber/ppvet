const API_BASE = 'http://localhost:3001/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export const api = {
  getClinic: () => request('/clinic'),
  updateClinic: (data: any) => request('/clinic', { method: 'PUT', body: JSON.stringify(data) }),
  getDashboardStats: () => request('/dashboard/stats'),
  getClients: (search?: string) => request(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getClient: (id: number) => request(`/clients/${id}`),
  createClient: (data: any) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: number, data: any) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAnimal: (id: number) => request(`/animals/${id}`),
  createAnimal: (data: any) => request('/animals', { method: 'POST', body: JSON.stringify(data) }),
  getAppointments: () => request('/appointments'),
  createAppointment: (data: any) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id: number, data: any) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createVisit: (data: any) => request('/visits', { method: 'POST', body: JSON.stringify(data) }),
  getProducts: () => request('/products'),
  createProduct: (data: any) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  getInvoices: () => request('/invoices'),
  createInvoice: (data: any) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  createPayment: (data: any) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  getBackup: () => request('/backup'),
};
