import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { buddyAPI } from '../services/api';

// Async thunks for buddy operations
export const fetchBuddies = createAsyncThunk(
  'buddy/fetchBuddies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await buddyAPI.getBuddies();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch buddies');
    }
  }
);

export const requestBuddy = createAsyncThunk(
  'buddy/requestBuddy',
  async (goalId, { rejectWithValue }) => {
    try {
      const response = await buddyAPI.requestBuddy(goalId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to request buddy');
    }
  }
);

export const acceptBuddyRequest = createAsyncThunk(
  'buddy/acceptBuddyRequest',
  async (relationshipId, { rejectWithValue }) => {
    try {
      const response = await buddyAPI.acceptBuddyRequest(relationshipId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to accept buddy request');
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'buddy/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await buddyAPI.getRecommendations();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch recommendations');
    }
  }
);

const initialState = {
  buddies: [],
  recommendations: [],
  loading: false,
  error: null,
};

const buddySlice = createSlice({
  name: 'buddy',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch buddies
      .addCase(fetchBuddies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuddies.fulfilled, (state, action) => {
        state.loading = false;
        state.buddies = action.payload.buddies || [];
      })
      .addCase(fetchBuddies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Request buddy
      .addCase(requestBuddy.fulfilled, (state, action) => {
        // Handle successful buddy request
      })
      // Accept buddy request
      .addCase(acceptBuddyRequest.fulfilled, (state, action) => {
        // Handle successful accept
      })
      // Fetch recommendations
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload.recommendations || [];
      });
  },
});

export const { clearError } = buddySlice.actions;
export default buddySlice.reducer; 