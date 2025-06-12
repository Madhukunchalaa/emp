import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { managerService } from '../../services/api';

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'manager/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await managerService.getEmployees();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const fetchProjects = createAsyncThunk(
  'manager/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await managerService.getProjects();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const assignProject = createAsyncThunk(
  'manager/assignProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await managerService.assignProject(projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign project');
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  'manager/updateProjectStatus',
  async ({ projectId, status }, { rejectWithValue }) => {
    try {
      const response = await managerService.updateProjectStatus({ projectId, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating project status');
    }
  }
);

export const fetchAttendanceHistory = createAsyncThunk(
  'manager/fetchAttendanceHistory',
  async (employeeId, { rejectWithValue }) => {
    try {
      console.log('Fetching attendance history for employee:', employeeId);
      const response = await managerService.getAttendanceHistory(employeeId);
      console.log('Attendance history response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance history');
    }
  }
);
export const fetchEmployeeDailyUpdates = createAsyncThunk(
  'manager/fetchEmployeeDailyUpdates',
  async ({ employeeId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await managerService.getEmployeeDailyUpdates({ employeeId, startDate, endDate });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee daily updates');
    }
  }
);






const initialState = {
  employees: [],
  projects: [],
  attendanceHistory: [],
  loading: false,
  error: null,
  employeeUpdates: [],
  success: null,
};

const managerSlice = createSlice({
  name: 'manager',
  initialState,
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
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
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
        state.projects.push(action.payload);
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
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        state.success = 'Project status updated successfully';
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Employee Daily Updates
.addCase(fetchEmployeeDailyUpdates.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(fetchEmployeeDailyUpdates.fulfilled, (state, action) => {
  state.loading = false;
  state.employeeUpdates = action.payload;
})
.addCase(fetchEmployeeDailyUpdates.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

      // Fetch Attendance History
      .addCase(fetchAttendanceHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceHistory = action.payload;
      })
      .addCase(fetchAttendanceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = managerSlice.actions;
export default managerSlice.reducer; 