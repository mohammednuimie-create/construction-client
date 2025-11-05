// API Utilities
// في Production، استخدم متغير البيئة. في Development، استخدم localhost
// للمشاركة المؤقتة مع Ngrok، استخدم رابط Ngrok
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://santo-fortuneless-elizabeth.ngrok-free.dev/api';

// Token Management
export const setToken = (token) => localStorage.setItem('jwtToken', token);
export const getToken = () => localStorage.getItem('jwtToken');
export const removeToken = () => localStorage.removeItem('jwtToken');

// User Management
export const setUser = (user) => {
  // Ensure _id is set if id exists
  if (user && user.id && !user._id) {
    user._id = user.id;
  }
  // Ensure id is set if _id exists
  if (user && user._id && !user.id) {
    user.id = user._id;
  }
  localStorage.setItem('user', JSON.stringify(user));
};
export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    const parsedUser = JSON.parse(user);
    // Ensure both id and _id are available
    if (parsedUser) {
      if (parsedUser.id && !parsedUser._id) {
        parsedUser._id = parsedUser.id;
      }
      if (parsedUser._id && !parsedUser.id) {
        parsedUser.id = parsedUser._id;
      }
    }
    return parsedUser;
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return null;
  }
};
export const removeUser = () => localStorage.removeItem('user');

// API Call Helper
const callApi = async (endpoint, method = 'GET', data = null, auth = true) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-ngrok-skip-browser-warning': 'true', // Skip Ngrok warning page
    'ngrok-skip-browser-warning': 'true', // Alternative header
  };
  
  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`📤 [API] ${method} ${endpoint}`, data ? 'with data' : '');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log(`📥 [API] Response status: ${response.status} ${response.statusText}`);
    console.log(`📥 [API] Content-Type: ${response.headers.get('content-type')}`);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log(`✅ [API] Response data:`, responseData);
    } else {
      const text = await response.text();
      
      // Check if it's Ngrok warning page
      if (text.includes('ngrok') && text.includes('<!DOCTYPE html>')) {
        console.error(`❌ [API] Ngrok warning page detected. Trying to bypass...`);
        throw new Error('Ngrok warning page detected. Please verify the tunnel is running and try refreshing the page.');
      }
      
      console.error(`❌ [API] Non-JSON response:`, text.substring(0, 200));
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`❌ [API] Error response:`, errorMessage);
      throw new Error(errorMessage);
    }
    return responseData;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    
    // Handle network errors (fetch fails, no response)
    if (!error.response && (error.message.includes('fetch') || 
        error.message.includes('NetworkError') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.name === 'TypeError')) {
      throw new Error('فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت أو أن الخادم يعمل.');
    }
    
    // Handle CORS errors
    if (error.message.includes('CORS') || 
        error.message.includes('Cross-Origin') ||
        error.message.includes('Not allowed by CORS')) {
      throw new Error('خطأ في الاتصال. يرجى المحاولة مرة أخرى أو تحديث الصفحة.');
    }
    
    // If error already has a message, use it; otherwise create a generic one
    throw error.message ? error : new Error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
};

// Auth API
export const authAPI = {
  register: (userData) => callApi('/auth/register', 'POST', userData, false),
  login: (email, password) => callApi('/auth/login', 'POST', { email, password }, false),
};

// Projects API
export const projectsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/projects?${queryString}`);
  },
  getById: (id) => callApi(`/projects/${id}`),
  create: (projectData) => callApi('/projects', 'POST', projectData),
  update: (id, updateData) => callApi(`/projects/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/projects/${id}`, 'DELETE'),
};

// Users API
export const usersAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/users?${queryString}`);
  },
  getById: (id) => callApi(`/users/${id}`),
  create: (userData) => callApi('/auth/register', 'POST', userData, false),
  update: (id, updateData) => callApi(`/users/${id}`, 'PUT', updateData),
};

// Materials API
export const materialsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/materials?${queryString}`);
  },
  getById: (id) => callApi(`/materials/${id}`),
  create: (materialData) => callApi('/materials', 'POST', materialData),
  update: (id, updateData) => callApi(`/materials/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/materials/${id}`, 'DELETE'),
};

// Suppliers API
export const suppliersAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/suppliers?${queryString}`);
  },
  getById: (id) => callApi(`/suppliers/${id}`),
  create: (supplierData) => callApi('/suppliers', 'POST', supplierData),
  update: (id, updateData) => callApi(`/suppliers/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/suppliers/${id}`, 'DELETE'),
};

// Purchases API
export const purchasesAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/purchases?${queryString}`);
  },
  getById: (id) => callApi(`/purchases/${id}`),
  create: (purchaseData) => callApi('/purchases', 'POST', purchaseData),
  update: (id, updateData) => callApi(`/purchases/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/purchases/${id}`, 'DELETE'),
};

// Payments API
export const paymentsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/payments?${queryString}`);
  },
  getById: (id) => callApi(`/payments/${id}`),
  create: (paymentData) => callApi('/payments', 'POST', paymentData),
  update: (id, updateData) => callApi(`/payments/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/payments/${id}`, 'DELETE'),
};

// Issues API
export const issuesAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/issues?${queryString}`);
  },
  getById: (id) => callApi(`/issues/${id}`),
  create: (issueData) => callApi('/issues', 'POST', issueData),
  update: (id, updateData) => callApi(`/issues/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/issues/${id}`, 'DELETE'),
};

// Contracts API
export const contractsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/contracts?${queryString}`);
  },
  getById: (id) => callApi(`/contracts/${id}`),
  create: (contractData) => callApi('/contracts', 'POST', contractData),
  update: (id, updateData) => callApi(`/contracts/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/contracts/${id}`, 'DELETE'),
};

// Requests API
export const requestsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/requests?${queryString}`);
  },
  getById: (id) => callApi(`/requests/${id}`),
  create: (requestData) => callApi('/requests', 'POST', requestData),
  update: (id, updateData) => callApi(`/requests/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/requests/${id}`, 'DELETE'),
};

// Reports API
export const reportsAPI = {
  getAll: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return callApi(`/reports?${queryString}`);
  },
  getById: (id) => callApi(`/reports/${id}`),
  create: (reportData) => callApi('/reports', 'POST', reportData),
  update: (id, updateData) => callApi(`/reports/${id}`, 'PUT', updateData),
  remove: (id) => callApi(`/reports/${id}`, 'DELETE'),
};


