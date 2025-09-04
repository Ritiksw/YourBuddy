import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200EE',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Buddy Dashboard'}}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{title: 'Chat with Buddy'}}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{title: 'Create Account'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 