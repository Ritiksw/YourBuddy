import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Docker backend URL - automatically detects your PC IP
const getBaseUrl = () => {
  if (__DEV__) {
    // Get the IP address from Expo development server
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    
    // Use your specific IP address for reliable connection
    const PC_IP = '192.168.1.46'; // Your actual PC IP from ipconfig
    
    if (Platform.OS === 'android') {
      // For Android emulator, use 10.0.2.2 (maps to localhost)
      // For real Android device, use PC IP
      const ip = debuggerHost || PC_IP;
      return `http://${ip}:8080/api`;
    } else {
      // For iOS, use the debugger host IP or your PC IP
      const ip = debuggerHost || PC_IP;
      return `http://${ip}:8080/api`;
    }
  } else {
    // For production, use your production API URL
    return 'http://your-production-api.com/api';
  }
};

const BASE_URL = getBaseUrl();

// Create axios instance with better configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // Increased timeout for mobile networks
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    return status < 500; // Don't throw for 4xx errors, handle them gracefully
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
    return Promise.reject({
      message: 'Request setup failed',
      originalError: error
    });
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    // Handle 4xx errors gracefully
    throw {
      message: response.data?.error || response.data?.message || 'Request failed',
      status: response.status,
      data: response.data
    };
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - logout user
      await AsyncStorage.removeItem('authToken');
      throw {
        message: 'Session expired. Please login again.',
        status: 401,
        requiresLogin: true
      };
    }
    
    // Network or other errors
    if (!error.response) {
      throw {
        message: 'Network error. Please check your connection and try again.',
        isNetworkError: true
      };
    }
    
    throw {
      message: error.response?.data?.error || error.response?.data?.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    };
  }
);

// Authentication API with better error handling
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

// Goals API with error handling
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