import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Docker backend URL - works with Expo
const BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - logout user
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      return await apiClient.post('/auth/register', userData);
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      return await apiClient.get('/auth/me');
    } catch (error) {
      throw error;
    }
  },
};

// Goals API
export const goalsAPI = {
  getGoals: async () => {
    try {
      return await apiClient.get('/goals');
    } catch (error) {
      throw error;
    }
  },

  createGoal: async (goalData) => {
    try {
      return await apiClient.post('/goals', goalData);
    } catch (error) {
      throw error;
    }
  },

  updateGoal: async (goalId, goalData) => {
    try {
      return await apiClient.put(`/goals/${goalId}`, goalData);
    } catch (error) {
      throw error;
    }
  },

  deleteGoal: async (goalId) => {
    try {
      return await apiClient.delete(`/goals/${goalId}`);
    } catch (error) {
      throw error;
    }
  },
};

// Buddy API
export const buddyAPI = {
  getBuddies: async () => {
    try {
      return await apiClient.get('/buddies/my-buddies');
    } catch (error) {
      throw error;
    }
  },

  requestBuddy: async (goalId) => {
    try {
      return await apiClient.post(`/buddies/request/${goalId}`);
    } catch (error) {
      throw error;
    }
  },

  acceptBuddyRequest: async (relationshipId) => {
    try {
      return await apiClient.post(`/buddies/accept/${relationshipId}`);
    } catch (error) {
      throw error;
    }
  },

  rejectBuddyRequest: async (relationshipId) => {
    try {
      return await apiClient.delete(`/buddies/reject/${relationshipId}`);
    } catch (error) {
      throw error;
    }
  },

  getRecommendations: async () => {
    try {
      return await apiClient.get('/buddies/recommendations');
    } catch (error) {
      throw error;
    }
  },

  getPendingRequests: async () => {
    try {
      return await apiClient.get('/buddies/pending-requests');
    } catch (error) {
      throw error;
    }
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (messageData) => {
    try {
      return await apiClient.post('/chat/send', messageData);
    } catch (error) {
      throw error;
    }
  },

  getChatHistory: async (receiverId) => {
    try {
      return await apiClient.get(`/chat/history/${receiverId}`);
    } catch (error) {
      throw error;
    }
  },

  getUnreadMessages: async () => {
    try {
      return await apiClient.get('/chat/unread');
    } catch (error) {
      throw error;
    }
  },
};

// Health check API
export const healthAPI = {
  checkHealth: async () => {
    try {
      return await apiClient.get('/actuator/health');
    } catch (error) {
      throw error;
    }
  },
};

// Notification API
export const notificationAPI = {
  registerToken: async (tokenData) => {
    try {
      return await apiClient.post('/notifications/register-token', tokenData);
    } catch (error) {
      throw error;
    }
  },

  sendNotification: async (notificationData) => {
    try {
      return await apiClient.post('/notifications/send', notificationData);
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient; 