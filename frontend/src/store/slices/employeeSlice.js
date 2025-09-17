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

export const addWorkUpdate = createAsyncThunk(
  'employee/addWorkUpdate',
  async (updateData, { rejectWithValue }) => {
    try {
      console.log('Sending daily update to API:', updateData); 

      if (!updateData.update || !updateData.userId) {
        throw new Error('Missing required fields: update and userId');
      }

      const response = await api.post('/employee/work-update', updateData);
      return response.data;
    } catch (error) {
      console.error('API Error Response:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const createWorkUpdate = createAsyncThunk(
  'employee/createWorkUpdate',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/employee/work-update', updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating work update');
    }
  }
);

export const fetchWorkUpdates = createAsyncThunk(
  'employee/fetchWorkUpdates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/employee/work-updates');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching work updates');
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
    workUpdates: [],
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
      .addCase(addWorkUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addWorkUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Work update added successfully';
      })
      .addCase(addWorkUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Work Update
      .addCase(createWorkUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.workUpdates.unshift(action.payload);
        state.success = 'Work update created successfully';
      })
      .addCase(createWorkUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Work Updates
      .addCase(fetchWorkUpdates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkUpdates.fulfilled, (state, action) => {
        state.loading = false;
        state.workUpdates = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWorkUpdates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.workUpdates = [];
      });
  },
});

export const { clearError, clearSuccess, setError, setSuccess } = employeeSlice.actions;
export default employeeSlice.reducer;