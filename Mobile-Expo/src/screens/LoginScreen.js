import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { healthAPI } from '../services/api';
import apiClient from '../services/api';
import Constants from 'expo-constants';

const LoginScreen = ({ navigation }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiUrl, setApiUrl] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    checkBackendHealth();
    setApiUrl(apiClient.defaults.baseURL);
  }, []);

  const checkBackendHealth = async () => {
    try {
      await healthAPI.checkHealth();
      setBackendStatus('connected');
    } catch (error) {
      console.log('Backend health check failed:', error);
      setBackendStatus('disconnected');
    }
  };

  const showDebugInfo = () => {
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    Alert.alert(
      'Debug Info',
      `API URL: ${apiUrl}\nExpo Host: ${debuggerHost || 'Not detected'}\nPlatform: ${Platform.OS}`,
      [
        { text: 'Test Connection', onPress: checkBackendHealth },
        { text: 'OK' }
      ]
    );
  };

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    dispatch(loginUser(credentials));
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Welcome to Buddy</Title>
          <Paragraph style={styles.subtitle}>
            Your Accountability Partner App
          </Paragraph>

          <TextInput
            label="👤 Username"
            value={credentials.username}
            onChangeText={(text) =>
              setCredentials({ ...credentials, username: text })
            }
            style={styles.input}
            autoCapitalize="none"
            disabled={loading}
            mode="outlined"
          />

          <TextInput
            label="🔒 Password"
            value={credentials.password}
            onChangeText={(text) =>
              setCredentials({ ...credentials, password: text })
            }
            style={styles.input}
            secureTextEntry
            disabled={loading}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={loading}
            disabled={loading || backendStatus === 'disconnected'}>
            Login
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            style={styles.linkButton}
            disabled={loading}>
            Don't have an account? Register
          </Button>

          <View style={styles.statusContainer}>
            <Text style={[
              styles.statusText,
              { color: backendStatus === 'connected' ? '#4CAF50' : '#F44336' }
            ]}>
              {backendStatus === 'connected' ? '✅' : '❌'} 
              Backend: {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Text>
            <Text style={styles.statusText}>
              🔗 {apiUrl}
            </Text>
            <TouchableOpacity onPress={showDebugInfo} style={styles.debugButton}>
              <Text style={styles.debugText}>🔧 Debug Info</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    marginBottom: 15,
    paddingVertical: 5,
  },
  linkButton: {
    marginTop: 10,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: 'center',
  },
  debugButton: {
    marginTop: 10,
    padding: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#6200EE',
  },
});

export default LoginScreen; 