import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchDesignerTasks = createAsyncThunk(
  'tasks/fetchDesignerTasks',
  async () => {
    const response = await api.get('/designs/my-tasks');
    return response.data;
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ taskId, status }) => {
    const response = await api.patch(`/designs/tasks/${taskId}/status`, { status });
    return response.data;
  }
);

export const assignDesignTask = createAsyncThunk(
  'tasks/assign',
  async ({ content, assignedTo, dueDate, priority }) => {
    const response = await api.post('/designs/tasks', {
      content,
      assignedTo,
      dueDate,
      priority,
    });
    return response.data;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Designer Tasks
      .addCase(fetchDesignerTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignerTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchDesignerTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Assign Design Task
      .addCase(assignDesignTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignDesignTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(assignDesignTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer; 