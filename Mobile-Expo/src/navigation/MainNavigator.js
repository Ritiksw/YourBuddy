import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens with error handling
import HomeScreen from '../screens/HomeScreen';
import GoalsScreen from '../screens/GoalsScreen';
import BuddiesScreen from '../screens/BuddiesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home'; // Default icon

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Goals':
              iconName = 'flag';
              break;
            case 'Buddies':
              iconName = 'people';
              break;
            case 'Chat':
              iconName = 'chat';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return (
            <MaterialIcons 
              name={iconName} 
              size={size || 24} 
              color={color || '#666'} 
            />
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
        component={GoalsScreen}
        options={{ 
          title: 'My Goals',
          tabBarLabel: 'Goals',
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