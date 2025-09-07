import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import GoalsScreen from '../screens/GoalsScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import GoalDetailsScreen from '../screens/GoalDetailsScreen';
import BuddiesScreen from '../screens/BuddiesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Goals Stack Navigator
const GoalsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200EE',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="GoalsList"
        component={GoalsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateGoal"
        component={CreateGoalScreen}
        options={{ 
          title: 'Create Goal',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="GoalDetails"
        component={GoalDetailsScreen}
        options={{ 
          title: 'Goal Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let emoji = '🏠'; // Default emoji

          switch (route.name) {
            case 'Home':
              emoji = '🏠';
              break;
            case 'Goals':
              emoji = '🎯';
              break;
            case 'Buddies':
              emoji = '👥';
              break;
            case 'Chat':
              emoji = '💬';
              break;
            case 'Profile':
              emoji = '👤';
              break;
            default:
              emoji = '🏠';
          }

          // Return emoji as text component (no font loading required)
          return (
            <Text style={{ 
              fontSize: size || 24, 
              opacity: focused ? 1 : 0.6 
            }}>
              {emoji}
            </Text>
          );
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#666666',
        headerStyle: {
          backgroundColor: '#6200EE',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsStackNavigator}
        options={{ 
          title: 'My Goals',
          tabBarLabel: 'Goals',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Buddies" 
        component={BuddiesScreen}
        options={{ 
          title: 'Find Buddies',
          tabBarLabel: 'Buddies',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ 
          title: 'Chat',
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator; 