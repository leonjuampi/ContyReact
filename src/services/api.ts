// src/services/api.ts
async function handleResponse(response: Response) {
  if (response.status === 204) { // Para DELETEs exitosos
    return;
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(new Error(error));
  }
  return data;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si 'Content-Type' es null, lo borramos (para FormData/subir archivos)
  if ((headers as any)['Content-Type'] === null) {
    delete (headers as any)['Content-Type'];
  }

  const defaultOptions: RequestInit = {
    method: 'GET',
    ...options,
    headers,
  };
  
  // Usamos el proxy de Vite que configuramos (ej. /api/customers)
  return fetch(url, defaultOptions);
}

// Nuestros métodos de API
export const api = {
  get: async (url: string, options: RequestInit = {}) => {
    const response = await fetchWithAuth(url, { ...options, method: 'GET' });
    return handleResponse(response);
  },

  post: async (url: string, body: any, headers: HeadersInit = {}) => {
    const options: RequestInit = {
      method: 'POST',
      body: headers['Content-Type'] === null ? body : JSON.stringify(body),
      headers
    };
    const response = await fetchWithAuth(url, options);
    return handleResponse(response);
  },

  put: async (url: string, body: any, options: RequestInit = {}) => {
    const response = await fetchWithAuth(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (url: string, options: RequestInit = {}) => {
    const response = await fetchWithAuth(url, { ...options, method: 'DELETE' });
    return handleResponse(response);
  },
  
  getBlob: async (url: string, options: RequestInit = {}) => {
    const response = await fetchWithAuth(url, { ...options, method: 'GET' });
    if (!response.ok) {
      const error = await response.json();
      return Promise.reject(error.message || 'Error al descargar archivo');
    }
    return response.blob();
  }
};