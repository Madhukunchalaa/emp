import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
export const fetchEmployeeProjects = createAsyncThunk(
  'employee/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching employee projects...');
      const response = await api.get('/employee/projects');
      console.log('Projects response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return rejectWithValue(error.response?.data?.message || 'Error fetching projects');
    }
  }
);

export const fetchAttendance = createAsyncThunk(
  'employee/fetchAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/employee/attendance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching attendance');
    }
  }
);

export const punchIn = createAsyncThunk(
  'employee/punchIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/employee/attendance/punch-in');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error punching in');
    }
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or however you store it
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});















export const punchOut = createAsyncThunk(
  'employee/punchOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/employee/attendance/punch-out');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error punching out');
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  'employee/updateProjectStatus',
  async ({ projectId, status, comment }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/employee/projects/${projectId}/status`, { status, comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating project status');
    }
  }
);

export const updateProjectComment = createAsyncThunk(
  'employee/updateProjectComment',
  async ({ projectId, comment }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/employee/projects/${projectId}/comment`, { comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating project comment');
    }
  }
);

export const addDailyUpdate = createAsyncThunk(
  'employee/addDailyUpdate',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/employee/daily-update', updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error adding daily update');
    }
  }
);

export const createDailyUpdate = createAsyncThunk(
  'employee/createDailyUpdate',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/employee/daily-update', updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating daily update');
    }
  }
);

export const fetchDailyUpdates = createAsyncThunk(
  'employee/fetchDailyUpdates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/employee/daily-updates');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching daily updates');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    projects: [],
    attendance: {
      today: null,
      history: []
    },
    dailyUpdates: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchEmployeeProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.projects = []; // Reset projects while loading
      })
      .addCase(fetchEmployeeProjects.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we always set an array
        state.projects = Array.isArray(action.payload) ? action.payload : [];
        console.log('Projects updated in Redux store:', state.projects);
      })
      .addCase(fetchEmployeeProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.projects = []; // Reset projects on error
      })
      // Fetch Attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we always have a valid structure
        if (action.payload && typeof action.payload === 'object') {
          state.attendance = {
            today: action.payload.today || null,
            history: Array.isArray(action.payload.history) ? action.payload.history : []
          };
        } else {
          state.attendance = { today: null, history: [] };
        }
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.attendance = {
          today: null,
          history: []
        };
      })
      // Punch In
      .addCase(punchIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(punchIn.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance.today = action.payload;
        state.success = 'Punched in successfully';
      })
      .addCase(punchIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Punch Out
      .addCase(punchOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(punchOut.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance.today = action.payload;
        state.success = 'Punched out successfully';
      })
      .addCase(punchOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Project Status
      .addCase(updateProjectStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.projects)) {
          const index = state.projects.findIndex(p => p._id === action.payload._id);
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
        state.success = 'Project status updated successfully';
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Project Comment
      .addCase(updateProjectComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectComment.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.projects)) {
          const index = state.projects.findIndex(p => p._id === action.payload._id);
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
        state.success = 'Project comment updated successfully';
      })
      .addCase(updateProjectComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Daily Update
      .addCase(addDailyUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDailyUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Daily update added successfully';
      })
      .addCase(addDailyUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Daily Update
      .addCase(createDailyUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDailyUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyUpdates.unshift(action.payload);
        state.success = 'Daily update created successfully';
      })
      .addCase(createDailyUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Daily Updates
      .addCase(fetchDailyUpdates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyUpdates.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyUpdates = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDailyUpdates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.dailyUpdates = [];
      });
  },
});

export const { clearError, clearSuccess, setError, setSuccess } = employeeSlice.actions;
export default employeeSlice.reducer; 