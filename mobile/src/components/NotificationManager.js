import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useSelector } from 'react-redux';
import firebaseService from '../services/firebaseService';
import Toast from 'react-native-toast-message';

const NotificationManager = ({ navigation }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      setupNotifications();
    }
  }, [isAuthenticated]);

  const setupNotifications = async () => {
    try {
      // Request permission
      const hasPermission = await firebaseService.requestUserPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Notifications Disabled',
          'Enable notifications in settings to receive important updates.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get and register FCM token
      await firebaseService.getFCMToken();

      // Subscribe to user-specific topic
      if (user?.username) {
        await firebaseService.subscribeToTopic(`user_${user.username}`);
        await firebaseService.subscribeToTopic('all_users');
      }

      // Set up foreground message handler
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('Foreground notification received:', remoteMessage);
        
        // Show toast notification when app is in foreground
        if (remoteMessage.notification) {
          Toast.show({
            type: 'info',
            text1: remoteMessage.notification.title || 'New Notification',
            text2: remoteMessage.notification.body || '',
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 60,
            onPress: () => {
              handleNotificationPress(remoteMessage);
            },
          });
        }
      });

      // Handle notification when app is opened from background/quit state
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
        handleNotificationPress(remoteMessage);
      });

      // Check if app was opened by a notification
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('App opened by notification:', remoteMessage);
            handleNotificationPress(remoteMessage);
          }
        });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const handleNotificationPress = (remoteMessage) => {
    try {
      // Log analytics event
      firebaseService.logEvent('notification_opened', {
        title: remoteMessage.notification?.title,
        data: JSON.stringify(remoteMessage.data || {}),
      });

      // Handle navigation based on notification data
      if (remoteMessage.data?.screen) {
        switch (remoteMessage.data.screen) {
          case 'Profile':
            navigation.navigate('Profile');
            break;
          case 'Settings':
            navigation.navigate('Settings');
            break;
          default:
            // Stay on current screen or navigate to home
            break;
        }
      }

      // Show notification details if needed
      if (remoteMessage.notification?.body) {
        setTimeout(() => {
          Alert.alert(
            remoteMessage.notification.title || 'Notification',
            remoteMessage.notification.body,
            [{ text: 'OK' }]
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  // This component doesn't render anything, it just manages notifications
  return null;
};

export default NotificationManager; 