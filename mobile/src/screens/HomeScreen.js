import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../store/authSlice';

const HomeScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Welcome, {user?.firstName || user?.username}!
      </Text>
      
      <Text style={styles.subtitle}>
        Your accountability journey starts here
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Chat')}>
        <Text style={styles.buttonText}>Chat with Buddy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handleLogout}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Logout
        </Text>
      </TouchableOpacity>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          🎯 Backend: Connected to Docker (localhost:8080)
        </Text>
        <Text style={styles.statusText}>
          📱 Mobile: React Native 0.74.1
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  secondaryButtonText: {
    color: '#6200EE',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
});

export default HomeScreen; 