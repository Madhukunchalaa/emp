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
      const response = await api.post('/employee/punch-in');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error punching in');
    }
  }
);

export const punchOut = createAsyncThunk(
  'employee/punchOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/employee/punch-out');
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

const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    projects: [],
    attendance: null,
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
        state.attendance = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Punch In
      .addCase(punchIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(punchIn.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
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
        state.attendance = action.payload;
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
      });
  },
});

export const { clearError, clearSuccess } = employeeSlice.actions;
export default employeeSlice.reducer; 