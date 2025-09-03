import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiHelper } from './api';

class FirebaseService {
  constructor() {
    this.initializeFirebase();
  }

  async initializeFirebase() {
    try {
      // Request permission for notifications
      await this.requestUserPermission();
      
      // Get FCM token
      await this.getFCMToken();
      
      // Set up message handlers
      this.setupMessageHandlers();
      
      // Initialize analytics
      await analytics().setAnalyticsCollectionEnabled(true);
      
      // Initialize crashlytics
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }

  async requestUserPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        return true;
      } else {
        console.log('Permission denied');
        return false;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Store token locally
      await AsyncStorage.setItem('fcmToken', token);
      
      // Register token with backend
      await this.registerTokenWithBackend(token);
      
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async registerTokenWithBackend(token) {
    try {
      const deviceInfo = {
        token: token,
        deviceType: Platform.OS,
        deviceName: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
        appVersion: '1.0.0',
      };

      await apiHelper.post('/notifications/register-token', deviceInfo);
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Error registering token with backend:', error);
    }
  }

  setupMessageHandlers() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      
      // Log analytics event
      await analytics().logEvent('notification_received', {
        title: remoteMessage.notification?.title,
        background: true,
      });
    });

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      
      // Log analytics event
      await analytics().logEvent('notification_received', {
        title: remoteMessage.notification?.title,
        background: false,
      });
      
      // You can show local notification here if needed
      // or update app state
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );
      
      // Navigate to specific screen based on notification data
      this.handleNotificationNavigation(remoteMessage);
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage,
          );
          this.handleNotificationNavigation(remoteMessage);
        }
      });
  }

  handleNotificationNavigation(remoteMessage) {
    // Handle navigation based on notification data
    if (remoteMessage.data?.screen) {
      // Navigate to specific screen
      console.log('Navigate to:', remoteMessage.data.screen);
    }
  }

  // Analytics methods
  async logEvent(eventName, parameters = {}) {
    try {
      await analytics().logEvent(eventName, parameters);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  async setUserId(userId) {
    try {
      await analytics().setUserId(userId.toString());
      await crashlytics().setUserId(userId.toString());
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  async setUserProperties(properties) {
    try {
      for (const [key, value] of Object.entries(properties)) {
        await analytics().setUserProperty(key, value);
      }
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  // Crashlytics methods
  async logError(error, context = {}) {
    try {
      await crashlytics().recordError(error);
      await crashlytics().setAttributes(context);
    } catch (err) {
      console.error('Crashlytics error:', err);
    }
  }

  async log(message) {
    try {
      await crashlytics().log(message);
    } catch (error) {
      console.error('Crashlytics log error:', error);
    }
  }

  // Topic subscription
  async subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
      
      // Also register with backend
      await apiHelper.post('/notifications/subscribe-topic', { topic });
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }

  async unsubscribeFromTopic(topic) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }

  // Clean up when user logs out
  async cleanup() {
    try {
      const token = await AsyncStorage.getItem('fcmToken');
      if (token) {
        await apiHelper.delete('/notifications/unregister-token', {
          data: { token }
        });
      }
      await AsyncStorage.removeItem('fcmToken');
    } catch (error) {
      console.error('Firebase cleanup error:', error);
    }
  }
}

export default new FirebaseService(); 