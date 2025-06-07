import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const submitDesign = createAsyncThunk(
  'designs/submit',
  async (formData) => {
    const response = await api.post('/designs/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const fetchDesignerSubmissions = createAsyncThunk(
  'designs/fetchDesignerSubmissions',
  async () => {
    const response = await api.get('/designs/my-submissions');
    return response.data;
  }
);

export const fetchAllDesigns = createAsyncThunk(
  'designs/fetchAll',
  async ({ status, designerId, startDate, endDate }) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (designerId) params.append('designerId', designerId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/designs/all?${params.toString()}`);
    return response.data;
  }
);

export const reviewDesign = createAsyncThunk(
  'designs/review',
  async ({ designId, status, managerComment }) => {
    const response = await api.patch(`/designs/${designId}/review`, {
      status,
      managerComment,
    });
    return response.data;
  }
);

const designSlice = createSlice({
  name: 'designs',
  initialState: {
    designs: [],
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
      // Submit Design
      .addCase(submitDesign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitDesign.fulfilled, (state, action) => {
        state.loading = false;
        state.designs.unshift(action.payload);
      })
      .addCase(submitDesign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Designer Submissions
      .addCase(fetchDesignerSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignerSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.designs = action.payload;
      })
      .addCase(fetchDesignerSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch All Designs
      .addCase(fetchAllDesigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDesigns.fulfilled, (state, action) => {
        state.loading = false;
        state.designs = action.payload;
      })
      .addCase(fetchAllDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Review Design
      .addCase(reviewDesign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reviewDesign.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.designs.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.designs[index] = action.payload;
        }
      })
      .addCase(reviewDesign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError } = designSlice.actions;
export default designSlice.reducer; 