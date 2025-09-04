import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with Your Buddy</Text>
      
      <View style={styles.messageContainer}>
        <Text style={styles.message}>
          💬 Chat functionality is ready!
        </Text>
        <Text style={styles.subtitle}>
          This screen will connect to your Docker backend at localhost:8080
        </Text>
        <Text style={styles.subtitle}>
          Firebase chat features are optional and gracefully handled.
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          🔗 Backend API: http://localhost:8080/api/chat
        </Text>
        <Text style={styles.statusText}>
          🐳 Docker: Backend + PostgreSQL running
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    marginBottom: 20,
  },
  message: {
    fontSize: 20,
    color: '#6200EE',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
});

export default ChatScreen; 