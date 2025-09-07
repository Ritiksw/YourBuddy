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

export const fetchPendingRequests = createAsyncThunk(
  'buddy/fetchPendingRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await buddyAPI.getPendingRequests();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pending requests');
    }
  }
);

const initialState = {
  buddies: [],
  recommendations: [],
  pendingRequests: [],
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
    removeBuddy: (state, action) => {
      state.buddies = state.buddies.filter(
        buddy => buddy.relationshipId !== action.payload
      );
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
      .addCase(requestBuddy.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestBuddy.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh recommendations after request
      })
      .addCase(requestBuddy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Accept buddy request
      .addCase(acceptBuddyRequest.fulfilled, (state, action) => {
        // Remove from pending requests and add to buddies
        state.pendingRequests = state.pendingRequests.filter(
          req => req.relationshipId !== action.payload.relationshipId
        );
      })
      // Fetch recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload.recommendations || [];
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch pending requests
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload.pendingRequests || [];
      });
  },
});

export const { clearError, removeBuddy } = buddySlice.actions;
export default buddySlice.reducer; 