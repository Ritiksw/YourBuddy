import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { goalsAPI } from '../services/api';

// Async thunks for goals operations
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.getGoals();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch goals');
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.createGoal(goalData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ goalId, goalData }, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.updateGoal(goalId, goalData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (goalId, { rejectWithValue }) => {
    try {
      await goalsAPI.deleteGoal(goalId);
      return goalId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete goal');
    }
  }
);

const initialState = {
  goals: [],
  activeGoals: [],
  completedGoals: [],
  loading: false,
  error: null,
  selectedGoal: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedGoal: (state, action) => {
      state.selectedGoal = action.payload;
    },
    clearSelectedGoal: (state) => {
      state.selectedGoal = null;
    },
    updateGoalProgress: (state, action) => {
      const { goalId, progress } = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (goal) {
        goal.currentProgress = progress;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload.goals || action.payload || [];
        
        // Categorize goals
        state.activeGoals = state.goals.filter(goal => 
          goal.status === 'ACTIVE'
        );
        state.completedGoals = state.goals.filter(goal => 
          goal.status === 'COMPLETED'
        );
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload);
        if (action.payload.status === 'ACTIVE') {
          state.activeGoals.push(action.payload);
        }
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update goal
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      // Delete goal
      .addCase(deleteGoal.fulfilled, (state, action) => {
        const goalId = action.payload;
        state.goals = state.goals.filter(goal => goal.id !== goalId);
        state.activeGoals = state.activeGoals.filter(goal => goal.id !== goalId);
        state.completedGoals = state.completedGoals.filter(goal => goal.id !== goalId);
      });
  },
});

export const { 
  clearError, 
  setSelectedGoal, 
  clearSelectedGoal, 
  updateGoalProgress 
} = goalsSlice.actions;

export default goalsSlice.reducer; 