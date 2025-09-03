import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import firebaseService from './src/services/firebaseService';

const App = () => {
  useEffect(() => {
    // Initialize Firebase services
    firebaseService.initializeFirebase();
    
    // Log app start event
    firebaseService.logEvent('app_start');
  }, []);

  return (
    <Provider store={store}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <AppNavigator />
      <Toast />
    </Provider>
  );
};

export default App; 