import axios from 'axios';
// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://emp-1-rgfq.onrender.com/api';

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
    console.log('API Request Interceptor - Token exists:', !!token);
    console.log('API Request Interceptor - URL:', config.url);
    if (token && !isLoggingOut) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request Interceptor - Added Bearer token');
    } else {
      console.log('API Request Interceptor - No token or logging out');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('API Response Interceptor - Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response Interceptor - Error:', error.response?.status, error.config?.url);
    console.log('API Response Interceptor - Error details:', error.response?.data);
    
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

  // Get tasks assigned by team leaders
  getMyTasks: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/employee/my-tasks');
  },

  // Update task status
  updateMyTaskStatus: (taskId, status) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put(`/employee/my-tasks/${taskId}/status`, { status });
  },

  // Punch in/out
  punchIn: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.post('/employee/attendance/punch-in');
  },

  punchOut: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.post('/employee/attendance/punch-out');
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

  // Add work updates functionality
  getWorkUpdates: () => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get('/employee/work-updates');
  },

  addWorkUpdate: (updateData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    
    // For FormData, don't set Content-Type header - let axios handle it automatically
    return api.post('/employee/work-update', updateData);
  },

  updateWorkUpdate: (updateId, updateData) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put(`/employee/work-updates/${updateId}`, updateData);
  },

  deleteWorkUpdate: (updateId) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.delete(`/employee/work-updates/${updateId}`);
  },

  updateTodayWorkingOn: (todayWorkingOn) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.put('/employee/today-working-on', { todayWorkingOn });
  },

  getMyWorkUpdates: (page = 1, limit = 10) => {
    if (!authService.isAuthenticated()) {
      return Promise.reject(new Error('No auth token'));
    }
    return api.get(`/employee/my-work-updates?page=${page}&limit=${limit}`);
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


  //update project
  getProject: (id) => api.get(`/manager/projects/${id}`),

  updateProject: (id, data) => api.put(`/manager/projects/${id}`, data),

  
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
  deleteProjectTask: (taskId) => api.delete(`/manager/project-tasks/${taskId}`),
  addProjectTaskComment: (taskId, formData) => api.post(`/manager/project-tasks/${taskId}/comments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
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
  getEmployeeUpdatesByDate: (employeeId, startDate, endDate) => api.get(`/manager/employee-updates?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`),
  getProjectUpdates: (projectId, startDate, endDate) => api.get(`/manager/project-updates?projectId=${projectId}&startDate=${startDate}&endDate=${endDate}`),
  approveRejectUpdate: (updateId, action, reason) => api.put(`/manager/updates/${updateId}/approve-reject`, { action, reason }),
  
  // Testing
  testAssign: (data) => api.post('/manager/test-assign', data),

  // Task Management
  getDesignTasks: () => api.get('/manager/design-tasks'),
  updateDesignTaskStatus: (taskId, data) => api.put(`/manager/design-tasks/${taskId}/status`, data),
  deleteDesignTask: (taskId) => api.delete(`/manager/design-tasks/${taskId}`),
  addTaskComment: (data) => api.post('/manager/task-comments', data),
  getTaskComments: (taskId) => api.get(`/manager/task-comments/${taskId}`),

  // Todos
  getTodos: (params) => api.get('/todos', { params }),
  getTodosByDate: (date) => api.get(`/todos/date/${date}`),
  getTodoStats: (params) => api.get('/todos/stats', { params }),
  createTodo: (data) => api.post('/todos', data),
  updateTodo: (id, data) => api.put(`/todos/${id}`, data),
  deleteTodo: (id) => api.delete(`/todos/${id}`),
  bulkUpdateTodos: (data) => api.put('/todos/bulk/update', data),

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

// Admin API functions
export const adminService = {
  // Get all employee IDs
  getEmpIds: async () => {
    try {
      const response = await api.get('/empid');
      return response;
    } catch (error) {
      console.error('Get employee IDs API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get admin users
  getAdminUsers: async () => {
    try {
      const response = await api.get('/empid/admin/users');
      return response;
    } catch (error) {
      console.error('Get admin users API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get admin projects
  getAdminProjects: async () => {
    try {
      const response = await api.get('/empid/admin/projects');
      return response;
    } catch (error) {
      console.error('Get admin projects API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get admin reports
  getAdminReports: async () => {
    try {
      const response = await api.get('/empid/admin/reports');
      return response;
    } catch (error) {
      console.error('Get admin reports API error:', error);
      throw error.response?.data || error;
    }
  },

  // Create employee ID
  createEmpId: async (empIdData) => {
    try {
      const response = await api.post('/empid', empIdData);
      return response;
    } catch (error) {
      console.error('Create employee ID API error:', error);
      throw error.response?.data || error;
    }
  },

  // Create batch employee IDs
  createBatchEmpIds: async (batchData) => {
    try {
      const response = await api.post('/empid/batch', batchData);
      return response;
    } catch (error) {
      console.error('Create batch employee IDs API error:', error);
      throw error.response?.data || error;
    }
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
  try {
    const response = await api.get('/team-leader/team-members');
    return response;
  } catch (error) {
    console.error('Get team members API error:', error);
    throw error.response?.data || error;
  }
};

export const getAvailableEmployees = async () => {
  try {
    const response = await api.get('/team-leader/available-employees');
    return response;
  } catch (error) {
    console.error('Get available employees API error:', error);
    throw error.response?.data || error;
  }
};

export const createTaskForTeamMember = async (taskData) => {
  try {
    const response = await api.post('/team-leader/tasks', taskData);
    return response;
  } catch (error) {
    console.error('Create task API error:', error);
    throw error.response?.data || error;
  }
};

export const assignEmployeeToTeam = async (employeeId) => {
  try {
    const response = await api.post('/team-leader/assign-employee', { employeeId });
    return response;
  } catch (error) {
    console.error('Assign employee API error:', error);
    throw error.response?.data || error;
  }
};

export const getTeamTasks = async () => {
  try {
    const response = await api.get('/team-leader/team-tasks');
    return response;
  } catch (error) {
    console.error('Get team tasks API error:', error);
    throw error.response?.data || error;
  }
};

// Chat API functions
export const chatService = {
  // Get chat history
  getChatHistory: async (user1, user2) => {
    try {
      const response = await api.get(`/employee/chat/history?user1=${user1}&user2=${user2}`);
      return response;
    } catch (error) {
      console.error('Get chat history API error:', error);
      throw error.response?.data || error;
    }
  },

  // Upload chat file
  uploadChatFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/employee/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Upload chat file API error:', error);
      throw error.response?.data || error;
    }
  }
};

// Website monitoring service
export const websiteService = {
  // Add a new website to monitor
  addWebsite: async (domain) => {
    try {
      const response = await api.post('/websites', { domain });
      return response;
    } catch (error) {
      console.error('Add website API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get all monitored websites
  getWebsites: async () => {
    try {
      const response = await api.get('/websites');
      return response;
    } catch (error) {
      console.error('Get websites API error:', error);
      throw error.response?.data || error;
    }
  },

  // Delete a website
  deleteWebsite: async (websiteId) => {
    try {
      const response = await api.delete(`/websites/${websiteId}`);
      return response;
    } catch (error) {
      console.error('Delete website API error:', error);
      throw error.response?.data || error;
    }
  },

  // Manual health check for a specific website
  checkWebsiteHealth: async (websiteId) => {
    try {
      const response = await api.post(`/websites/${websiteId}/check`);
      return response;
    } catch (error) {
      console.error('Check website health API error:', error);
      throw error.response?.data || error;
    }
  }
};

// Team Leader API functions
export const teamLeaderService = {
  // Get team members
  getTeamMembers: async () => {
    try {
      const response = await api.get('/team-leader/team-members');
      return response;
    } catch (error) {
      console.error('Get team members API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get assigned projects
  getAssignedProjects: async () => {
    try {
      const response = await api.get('/team-leader/assigned-projects');
      return response;
    } catch (error) {
      console.error('Get assigned projects API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get team tasks
  getTeamTasks: async () => {
    try {
      const response = await api.get('/team-leader/team-tasks');
      return response;
    } catch (error) {
      console.error('Get team tasks API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get activity log
  getActivityLog: async () => {
    try {
      const response = await api.get('/team-leader/activity-log');
      return response;
    } catch (error) {
      console.error('Get activity log API error:', error);
      throw error.response?.data || error;
    }
  },

  // Create task for team member
  createTask: async (taskData) => {
    try {
      const response = await api.post('/team-leader/tasks', taskData);
      return response;
    } catch (error) {
      console.error('Create task API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get available employees
  getAvailableEmployees: async () => {
    try {
      const response = await api.get('/team-leader/available-employees');
      return response;
    } catch (error) {
      console.error('Get available employees API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get project team
  getProjectTeam: async (projectId) => {
    try {
      const response = await api.get(`/team-leader/project/${projectId}/team`);
      return response;
    } catch (error) {
      console.error('Get project team API error:', error);
      throw error.response?.data || error;
    }
  },

  // Add member to project team
  addMemberToProject: async (projectId, empId) => {
    try {
      const response = await api.post(`/team-leader/project/${projectId}/add-member`, { empId });
      return response;
    } catch (error) {
      console.error('Add member to project API error:', error);
      throw error.response?.data || error;
    }
  },

  // Remove member from project team
  removeMemberFromProject: async (projectId, empId) => {
    try {
      const response = await api.post(`/team-leader/project/${projectId}/remove-member`, { empId });
      return response;
    } catch (error) {
      console.error('Remove member from project API error:', error);
      throw error.response?.data || error;
    }
  },

  // Get member tasks
  getMemberTasks: async (memberId) => {
    try {
      const response = await api.get(`/team-leader/member/${memberId}/tasks`);
      return response;
    } catch (error) {
      console.error('Get member tasks API error:', error);
      throw error.response?.data || error;
    }
  },

  // Send report
  sendReport: async (reportData) => {
    try {
      const response = await api.post('/team-leader/report', reportData);
      return response;
    } catch (error) {
      console.error('Send report API error:', error);
      throw error.response?.data || error;
    }
  }
};