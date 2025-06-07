import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/manager/projects');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching projects');
    }
  }
);

export const assignProject = createAsyncThunk(
  'projects/assignProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/manager/projects', projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error assigning project');
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  'projects/updateStatus',
  async ({ projectId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/manager/projects/${projectId}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating project status');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    items: [],
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
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Assign Project
      .addCase(assignProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.success = 'Project assigned successfully';
      })
      .addCase(assignProject.rejected, (state, action) => {
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
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.success = 'Project status updated successfully';
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = projectSlice.actions;
export default projectSlice.reducer; 