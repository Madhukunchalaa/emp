import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (credentials) => {
    try {
      console.log('Making login request to:', `${API_URL}/auth/login`);
      const response = await api.post('/auth/login', credentials);
      console.log('Login API response:', response);
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Employee service
export const employeeService = {
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (data) => api.put('/employee/profile', data),
  getProjects: () => api.get('/employee/projects'),
  updateProjectStatus: (projectId, status) => api.patch(`/employee/projects/${projectId}/status`, { status }),
  updateProjectComment: (projectId, comment) => api.patch(`/employee/projects/${projectId}/comment`, { comment }),
  punchIn: () => api.post('/employee/attendance/punch-in'),
  punchOut: () => api.post('/employee/attendance/punch-out'),
  getAttendance: () => api.get('/employee/attendance'),
};

// Manager service
export const managerService = {
  getProfile: () => api.get('/manager/profile'),
  updateProfile: (data) => api.put('/manager/profile', data),
  getEmployees: () => api.get('/manager/employees'),
  getProjects: () => api.get('/manager/projects'),
  assignProject: async (projectData) => {
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
  updateProjectStatus: ({ projectId, status }) => api.patch(`/manager/projects/${projectId}/status`, { status }),
  getAttendanceHistory: async (employeeId) => {
    try {
      console.log('Fetching attendance history for employee:', employeeId);
      const response = await api.get(`/manager/employees/${employeeId}/attendance`);
      console.log('Attendance history response:', response.data);
      return response;
    } catch (error) {
      console.error('Attendance history error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default api; 