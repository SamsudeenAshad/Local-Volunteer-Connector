// Auth slice for user authentication state management
// Created by Samsudeen Ashad

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }) => {
    // This will be implemented with Firebase Auth
    // For now, return mock data
    return {
      id: '1',
      email: credentials.email,
      name: 'John Doe',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
      },
      skills: ['First Aid', 'Communication'],
      interests: ['Environmental', 'Community Service'],
      volunteerHours: 25,
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: {
    email: string;
    password: string;
    name: string;
    location: { latitude: number; longitude: number; address: string };
  }) => {
    // This will be implemented with Firebase Auth
    return {
      id: '1',
      email: userData.email,
      name: userData.name,
      location: userData.location,
      skills: [],
      interests: [],
      volunteerHours: 0,
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  // This will be implemented with Firebase Auth
  return;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
