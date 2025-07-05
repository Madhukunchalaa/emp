import axios from 'axios';
const API_URL = 'http://localhost:5000/api';
// const API_URL = 'https://emp-1-rgfq.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL
});
// Flag to prevent multiple redirects and unwanted behavior during logout
let isRedirecting = false;
let isLoggingOut = false;

// Add request interceptor to add auth tokens
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
      throw error.response?.data || error;
    }
  },

  // Test function to check current user role
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      console.error('Get current user API error:', error);
      throw error.response?.data || error;
    }
  },

  // Forgot password - Send OTP
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.error('Forgot password API error:', error);
      throw error.response?.data || error;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response;
    } catch (error) {
      console.error('Verify OTP API error:', error);
      throw error.response?.data || error;
    }
  },

  // Verify registration OTP
  verifyRegistrationOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-registration-otp', { email, otp });
      return response;
    } catch (error) {
      console.error('Verify registration OTP API error:', error);
      throw error.response?.data || error;
    }
  },

  // Reset password
  resetPassword: async (email, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, newPassword });
      return response;
    } catch (error) {
      console.error('Reset password API error:', error);
      throw error.response?.data || error;
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
    return api.get('/employee/daily-updates');
  },

  addDailyUpdate: (updateData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    
    // For FormData, don't set Content-Type header - let axios handle it automatically
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
  },

  updateTodayWorkingOn: (todayWorkingOn) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put('/employee/today-working-on', { todayWorkingOn });
  },

  getMyDailyUpdates: (page = 1, limit = 10) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get(`/employee/my-daily-updates?page=${page}&limit=${limit}`);
  },

  updateTaskProgress: (taskId, progress) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    // Since we're treating projects as tasks, use the project endpoint
    return api.put(`/employee/projects/${taskId}/task-status`, { status: progress });
  },

  updateTaskStatus: (taskId, status) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put(`/employee/tasks/${taskId}/status`, { status });
  }
};

// Manager service
export const managerService = {
  getProfile: () => api.get('/manager/profile'),
  updateProfile: (data) => api.put('/manager/profile', data),
  
  // Employee management
  getEmployees: () => api.get('/manager/employees'),
  getEmployeeProfile: (id) => api.get(`/manager/employees/${id}`),
  
  // Team Leader management
  getTeamLeaders: () => api.get('/manager/team-leaders'),
  assignProjectToTeamLeader: (projectData) => api.post('/manager/projects/assign-to-team-leader', projectData),
  getTeamLeaderProjects: () => api.get('/manager/team-leader-projects'),
  
  // Project management
  getProjects: () => api.get('/manager/projects'),
  getProjectById: (id) => api.get(`/manager/projects/${id}`),
  createProject: (projectData) => api.post('/manager/projects', projectData),
  getAssignedProjects: () => api.get('/manager/projects/assigned'),
  assignTask: (taskData) => api.post('/manager/tasks/assign', taskData),
  updateTaskStatus: (taskId, status) => api.put(`/manager/project-tasks/${taskId}/status`, { status }),
  updateProjectTaskStatus: (taskId, status) => api.put(`/manager/project-tasks/${taskId}/status`, { status }),
  approveRejectTask: (taskId, status) => api.put(`/manager/tasks/${taskId}/approve`, { status }),
  getManagerDashboard: () => api.get('/manager/dashboard'),
  getDesignerTasks: (designerId) => api.get(`/manager/designers/${designerId}/tasks`),
  getTeam: () => api.get('/manager/team'),
  
  // Attendance
  getAttendanceHistory: () => api.get('/manager/attendance'),
  getEmployeeAttendance: (employeeId) => api.get(`/manager/employees/${employeeId}/attendance`),
  
  // Updates
  getEmployeeUpdates: () => api.get('/manager/updates'),
  getEmployeeUpdateSummary: () => api.get('/manager/employee-update-summary'),
  getAllEmployeeUpdates: () => api.get('/manager/all-updates'),
  approveRejectUpdate: (updateId, action, reason) => api.put(`/manager/updates/${updateId}/approve-reject`, { action, reason }),
  
  // Testing
  testAssign: (data) => api.post('/manager/test-assign', data),

  getUserById: async (id) => {
    try {
      const response = await api.get(`/manager/user/${id}`);
      return response;
    } catch (error) {
      console.error('Get user by ID API error:', error);
      throw error.response?.data || error;
    }
  },
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

export const applyForLeave = async (leaveData) => {
  const token = localStorage.getItem('token');
  const res = await api.post('/leaves/apply', leaveData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getMyLeaveHistory = async () => {
  const token = localStorage.getItem('token');
  const res = await api.get('/leaves/my-history', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAllLeaveRequests = async () => {
  const token = localStorage.getItem('token');
  const res = await api.get('/leaves/all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const reviewLeaveRequest = async (leaveId, status) => {
  const token = localStorage.getItem('token');
  const res = await api.patch(`/leaves/${leaveId}/review`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Add this at the bottom of the file, outside any other export or function
export const userService = {
  getUserById: async (id) => {
    try {
      const response = await api.get(`/manager/user/${id}`);
      return response;
    } catch (error) {
      console.error('Get user by ID API error:', error);
      throw error.response?.data || error;
    }
  },
  getAllUsers: async () => {
    try {
      const response = await api.get('/manager/users');
      return response;
    } catch (error) {
      console.error('Get all users API error:', error);
      throw error.response?.data || error;
    }
  },
};

// Team Leader API functions
export const getTeamMembers = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/team-leader/team-members', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const getAvailableEmployees = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/team-leader/available-employees', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const createTaskForTeamMember = async (taskData) => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/team-leader/create-task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });
  return res.json();
};

export const assignEmployeeToTeam = async (teamId, employeeId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/api/team-leader/assign-employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ teamId, employeeId })
  });
  return res.json();
};

export const getTeamTasks = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/team-leader/team-tasks', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};