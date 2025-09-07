import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Docker backend URL - automatically detects your PC IP from Expo
const getBaseUrl = () => {
  if (__DEV__) {
    // Get the IP address from Expo development server (this was the working solution!)
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    
    console.log('Expo debugger host detected:', debuggerHost);
    
    if (debuggerHost) {
      // Use the IP that Expo is already using for development
      console.log(`Using Expo detected IP: ${debuggerHost}:8080`);
      return `http://${debuggerHost}:8080/api`;
    } else {
      // Fallback to your known working IP
      console.log('Fallback to known IP: 192.168.1.46:8080');
      return `http://192.168.1.46:8080/api`;
    }
  } else {
    // For production
    return 'http://your-production-api.com/api';
  }
};

const BASE_URL = getBaseUrl();
console.log('API Base URL:', BASE_URL);

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
    console.log('API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      // Handle unauthorized - logout user
      await AsyncStorage.removeItem('authToken');
    }
    
    // Handle different error response formats
    let errorMessage = 'Network error';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = JSON.stringify(error.response.data);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Promise.reject({ message: errorMessage });
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('Attempting login to:', BASE_URL + '/auth/login');
      const response = await apiClient.post('/auth/login', credentials);
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      return response;
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Attempting registration to:', BASE_URL + '/auth/register');
      return await apiClient.post('/auth/register', userData);
    } catch (error) {
      console.log('Registration error:', error);
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
      console.log('Fetching goals from:', BASE_URL + '/goals');
      return await apiClient.get('/goals');
    } catch (error) {
      console.error('Get goals error:', error);
      throw error;
    }
  },

  createGoal: async (goalData) => {
    try {
      console.log('Creating goal with data:', goalData);
      console.log('API endpoint:', BASE_URL + '/goals');
      
      const response = await apiClient.post('/goals', goalData);
      console.log('Goal created successfully:', response);
      return response;
    } catch (error) {
      console.error('Create goal error:', error);
      throw error;
    }
  },

  updateGoal: async (goalId, goalData) => {
    try {
      console.log('Updating goal:', goalId, goalData);
      return await apiClient.put(`/goals/${goalId}`, goalData);
    } catch (error) {
      console.error('Update goal error:', error);
      throw error;
    }
  },

  deleteGoal: async (goalId) => {
    try {
      console.log('Deleting goal:', goalId);
      return await apiClient.delete(`/goals/${goalId}`);
    } catch (error) {
      console.error('Delete goal error:', error);
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
      console.log('Checking health at:', BASE_URL + '/actuator/health');
      return await apiClient.get('/actuator/health');
    } catch (error) {
      console.log('Health check failed:', error);
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