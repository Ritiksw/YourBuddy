import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI } from '../services/api';

// Async thunks for chat operations
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await chatAPI.sendMessage(messageData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async (receiverId, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getChatHistory(receiverId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch chat history');
    }
  }
);

export const fetchUnreadMessages = createAsyncThunk(
  'chat/fetchUnreadMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getUnreadMessages();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch unread messages');
    }
  }
);

const initialState = {
  messages: [],
  unreadCount: 0,
  currentChat: null,
  loading: false,
  error: null,
  firebaseAvailable: true, // Will be set to false if Firebase not configured
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setFirebaseAvailable: (state, action) => {
      state.firebaseAvailable = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.status === 'firebase_not_configured') {
          state.firebaseAvailable = false;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch chat history
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.messages = action.payload;
        } else if (action.payload.status === 'firebase_not_configured') {
          state.firebaseAvailable = false;
          state.messages = [];
        }
      })
      // Fetch unread messages
      .addCase(fetchUnreadMessages.fulfilled, (state, action) => {
        if (action.payload.status === 'firebase_not_configured') {
          state.firebaseAvailable = false;
          state.unreadCount = 0;
        } else {
          state.unreadCount = action.payload.unreadCount || 0;
        }
      });
  },
});

export const { clearError, setCurrentChat, setFirebaseAvailable, addMessage } = chatSlice.actions;
export default chatSlice.reducer; 