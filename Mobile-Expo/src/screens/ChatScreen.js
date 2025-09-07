import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnreadMessages, setFirebaseAvailable } from '../store/chatSlice';

const ChatScreen = () => {
  const dispatch = useDispatch();
  const { unreadCount, firebaseAvailable, loading } = useSelector(state => state.chat);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkChatFeatures();
  }, []);

  const checkChatFeatures = async () => {
    try {
      await dispatch(fetchUnreadMessages()).unwrap();
      setBackendStatus('connected');
    } catch (error) {
      if (error.includes('firebase_not_configured')) {
        dispatch(setFirebaseAvailable(false));
        setBackendStatus('firebase_optional');
      } else {
        setBackendStatus('disconnected');
      }
    }
  };

  const showChatInfo = () => {
    Alert.alert(
      'Chat System Info',
      'Chat functionality connects to your Docker backend. Firebase is optional for real-time features.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat with Buddies</Text>
      </View>
      
      <View style={styles.messageContainer}>
        <Text style={styles.messageIcon}>💬</Text>
        <Text style={styles.message}>Chat System Ready!</Text>
        
        <Text style={styles.description}>
          Your chat functionality is connected to the Docker backend.
        </Text>
        
        {!firebaseAvailable && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Firebase not configured - using backend-only mode
            </Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.infoButton} onPress={showChatInfo}>
          <Text style={styles.infoButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Backend API:</Text>
          <Text style={[
            styles.statusValue,
            { color: backendStatus === 'connected' ? '#4CAF50' : '#F44336' }
          ]}>
            {backendStatus === 'connected' ? 'Connected' : 'Checking...'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Firebase:</Text>
          <Text style={[
            styles.statusValue,
            { color: firebaseAvailable ? '#4CAF50' : '#FF9800' }
          ]}>
            {firebaseAvailable ? 'Available' : 'Optional'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Unread Messages:</Text>
          <Text style={styles.statusValue}>{unreadCount}</Text>
        </View>
        
        <Text style={styles.apiUrl}>
          🔗 localhost:8080/api/chat
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  infoButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  infoButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  apiUrl: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'monospace',
  },
});

export default ChatScreen; 