import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Login attempt with credentials:', credentials);
      const response = await authService.login(credentials);
      console.log('Login response:', response.data);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userRole', response.data.user.role.toLowerCase());
      
      return response.data;
    } catch (error) {
      console.error('Login error in thunk:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

// Initialize userRole in localStorage if user data exists
const storedUser = localStorage.getItem('user');
if (storedUser) {
  try {
    const user = JSON.parse(storedUser);
    if (user.role && !localStorage.getItem('userRole')) {
      localStorage.setItem('userRole', user.role);
    }
  } catch (error) {
    console.error('Error parsing stored user data:', error);
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Don't set authentication state since user is not created yet
        // Just store the message for display
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 