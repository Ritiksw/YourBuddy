import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatAPI } from '../services/api';

// Async thunks for chat operations
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await chatAPI.sendMessage(messageData);
      return { ...response, messageData };
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
  chatHistory: {}, // Store chat history by receiverId
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
      // Load messages for current chat
      state.messages = state.chatHistory[action.payload] || [];
    },
    setFirebaseAvailable: (state, action) => {
      state.firebaseAvailable = action.payload;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      state.messages.push(message);
      
      // Also update chat history
      const chatKey = message.receiverId;
      if (!state.chatHistory[chatKey]) {
        state.chatHistory[chatKey] = [];
      }
      state.chatHistory[chatKey].push(message);
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.messages = [];
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
        } else {
          // Add sent message to current chat
          const message = {
            id: action.payload.messageId,
            content: action.payload.messageData.content,
            senderId: 'current_user', // Will be replaced with actual user ID
            timestamp: new Date().toISOString(),
            type: action.payload.messageData.type || 'text',
          };
          state.messages.push(message);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch chat history
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.messages = action.payload;
          // Store in history
          if (state.currentChat) {
            state.chatHistory[state.currentChat] = action.payload;
          }
        } else if (action.payload.status === 'firebase_not_configured') {
          state.firebaseAvailable = false;
          state.messages = [];
        }
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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

export const { 
  clearError, 
  setCurrentChat, 
  setFirebaseAvailable, 
  addMessage, 
  clearCurrentChat 
} = chatSlice.actions;

export default chatSlice.reducer; 