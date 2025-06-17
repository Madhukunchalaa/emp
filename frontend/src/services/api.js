import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple redirects and unwanted behavior during logout
let isRedirecting = false;
let isLoggingOut = false;

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !isLoggingOut) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 if we're not already logging out or redirecting
    if (error.response?.status === 401 && !isRedirecting && !isLoggingOut) {
      isRedirecting = true;
      
      console.log('401 Unauthorized - Token expired or invalid');
      
      // Clean up storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        console.log('Redirecting to login due to 401');
        // Use a slight delay to prevent multiple redirects
        setTimeout(() => {
          window.location.href = '/login';
          isRedirecting = false;
        }, 100);
      } else {
        isRedirecting = false;
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth service
export const authService = {
  login: async (credentials) => {
    try {
      console.log('Making login request with credentials:', credentials);
      isLoggingOut = false; // Reset logout flag on login
      const response = await api.post('/auth/login', credentials);
      console.log('Login API response:', response.data);
      return response;
    } catch (error) {
      console.error('Login API error:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  logout: () => {
    console.log('Auth service logout initiated');
    
    // Set flags to prevent interceptor interference
    isLoggingOut = true;
    isRedirecting = true;
    
    // Clean up storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset flags after cleanup
    setTimeout(() => {
      isLoggingOut = false;
      isRedirecting = false;
      console.log('Auth service logout completed');
    }, 500);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token && !isLoggingOut;
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

// Employee service
export const employeeService = {
  getProfile: () => {
    // Check if token exists and user is not logging out
    if (!authService.isAuthenticated()) {
      console.log('No auth token or user logging out - skipping profile request');
      return Promise.reject(new Error('No auth token or user logging out'));
    }
    console.log('Fetching employee profile');
    return api.get('/employee/profile');
  },

  updateProfile: (data) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put('/employee/profile', data);
  },

  getProjects: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/employee/projects');
  },

  updateProjectStatus: (projectId, status) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.patch(`/employee/projects/${projectId}/status`, { status });
  },

  updateProjectComment: (projectId, comment) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.patch(`/employee/projects/${projectId}/comment`, { comment });
  },

  punchIn: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    console.log('PunchIn API called by user action');
    return api.post('/employee/attendance/punch-in');
  },

  punchOut: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    console.log('PunchOut API called by user action');
    return api.post('/employee/attendance/punch-out');
  },

  getAttendance: () => {
    // Check if token exists and user is not logging out
    if (!authService.isAuthenticated()) {
      console.log('No auth token or user logging out - skipping attendance request');
      return Promise.reject(new Error('No auth token or user logging out'));
    }
    console.log('Fetching attendance data');
    return api.get('/employee/attendance');
  },

  // Add daily updates functionality
  getDailyUpdates: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/employee/updates');
  },

  addDailyUpdate: (updateData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.post('/employee/daily-update', updateData);
  },

  updateDailyUpdate: (updateId, updateData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put(`/employee/daily-updates/${updateId}`, updateData);
  },

  deleteDailyUpdate: (updateId) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.delete(`/employee/daily-updates/${updateId}`);
  }
};

// Manager service
export const managerService = {
  getProfile: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/manager/profile');
  },

  updateProfile: (data) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put('/manager/profile', data);
  },

  getEmployees: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/manager/employees');
  },

  getProjects: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/manager/projects');
  },

  assignProject: async (projectData) => {
    if (!authService.isAuthenticated()) {
      throw new Error('No auth token');
    }
    
    try {
      console.log('Assigning project:', projectData);
      const response = await api.post('/manager/projects', projectData);
      console.log('Project assignment response:', response.data);
      return response;
    } catch (error) {
      console.error('Project assignment error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProjectStatus: ({ projectId, status }) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.patch(`/manager/projects/${projectId}/status`, { status });
  },

  getAttendanceHistory: async (employeeId) => {
    if (!authService.isAuthenticated()) {
      throw new Error('No auth token');
    }

    try {
      console.log('Fetching attendance history for employee:', employeeId);
      
      const token = authService.getToken();
      const response = await api.get(`/manager/employees/${employeeId}/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Attendance history response:', response.data);
      return response;
    } catch (error) {
      console.error('Attendance history error:', error.response?.data || error.message);
      throw error;
    }
  },

  getEmployeeDailyUpdates: async ({ employeeId, startDate, endDate }) => {
    if (!authService.isAuthenticated()) {
      throw new Error('No auth token');
    }

    try {
      const response = await api.get('/manager/daily-updates', {
        params: { employeeId, startDate, endDate }
      });
      return response;
    } catch (error) {
      console.error('Error fetching employee daily updates:', error.response?.data || error.message);
      throw error;
    }
  },

  // Additional manager functions
  getEmployeeById: (employeeId) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get(`/manager/employees/${employeeId}`);
  },

  updateEmployee: (employeeId, updateData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put(`/manager/employees/${employeeId}`, updateData);
  },

  deleteEmployee: (employeeId) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.delete(`/manager/employees/${employeeId}`);
  },

  getProjectById: (projectId) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get(`/manager/projects/${projectId}`);
  },

  updateProject: (projectId, updateData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put(`/manager/projects/${projectId}`, updateData);
  },

  deleteProject: (projectId) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.delete(`/manager/projects/${projectId}`);
  },

  // Reports and analytics
  getAttendanceReport: (params) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/manager/reports/attendance', { params });
  },

  getProjectReport: (params) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/manager/reports/projects', { params });
  },

  getProductivityReport: (params) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/manager/reports/productivity', { params });
  }
};

// Admin service (if needed)
export const adminService = {
  getUsers: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/admin/users');
  },

  createUser: (userData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.post('/admin/users', userData);
  },

  updateUser: (userId, userData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put(`/admin/users/${userId}`, userData);
  },

  deleteUser: (userId) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.delete(`/admin/users/${userId}`);
  },

  getSystemSettings: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/admin/settings');
  },

  updateSystemSettings: (settings) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put('/admin/settings', settings);
  }
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleApiError: (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return { message: data.message || 'Bad request', status };
        case 401:
          return { message: 'Unauthorized access', status };
        case 403:
          return { message: 'Access forbidden', status };
        case 404:
          return { message: 'Resource not found', status };
        case 500:
          return { message: 'Internal server error', status };
        default:
          return { message: data.message || 'An error occurred', status };
      }
    } else if (error.request) {
      // Network error
      return { message: 'Network error - please check your connection', status: 0 };
    } else {
      // Other error
      return { message: error.message || 'An unexpected error occurred', status: -1 };
    }
  },

  // Format API responses consistently
  formatResponse: (response) => {
    return {
      data: response.data,
      status: response.status,
      message: response.data.message || 'Success'
    };
  },

  // Check if API is available
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return { status: 'online', data: response.data };
    } catch (error) {
      return { status: 'offline', error: error.message };
    }
  }
};

// Export the axios instance for direct use if needed
export { api };

// Default export
export default api;