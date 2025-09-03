import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import NotificationManager from '../components/NotificationManager';
import { setCredentials, getCurrentUser } from '../store/authSlice';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (token && userInfo) {
        const user = JSON.parse(userInfo);
        dispatch(setCredentials({ user, token }));
        
        // Verify token is still valid by fetching current user
        try {
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          // Token is invalid, clear storage
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userInfo');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    // You can show a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      {/* Notification Manager - handles Firebase notifications */}
      <NotificationManager />
      
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        {isAuthenticated ? (
          // Authenticated user screens
          <Stack.Group>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                title: 'Buddy App',
                headerLeft: null, // Disable back button
              }}
            />
          </Stack.Group>
        ) : (
          // Authentication screens
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 