import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { fetchGoals } from '../store/goalsSlice';
import { fetchBuddies } from '../store/buddySlice';
import { fetchUnreadMessages } from '../store/chatSlice';
import { healthAPI } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { goals } = useSelector(state => state.goals);
  const { buddies } = useSelector(state => state.buddy);
  const { unreadCount } = useSelector(state => state.chat);
  
  const [backendStatus, setBackendStatus] = useState('checking');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await healthAPI.checkHealth();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const loadDashboardData = () => {
    dispatch(fetchGoals());
    dispatch(fetchBuddies());
    dispatch(fetchUnreadMessages());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkBackendHealth();
    loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const activeGoals = goals?.filter(goal => goal.status === 'ACTIVE') || [];
  const completedGoals = goals?.filter(goal => goal.status === 'COMPLETED') || [];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          Welcome back, {user?.firstName || user?.username}! 👋
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Ready to achieve your goals with your accountability buddies?
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeGoals.length}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{buddies?.length || 0}</Text>
          <Text style={styles.statLabel}>Buddies</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedGoals.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unreadCount || 0}</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Goals')}>
            <Text style={styles.actionButtonText}>🎯 View Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Buddies')}>
            <Text style={styles.actionButtonText}>👥 Find Buddies</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Chat')}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              💬 Chat {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              👤 Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Backend Status */}
      <View style={styles.statusCard}>
        <Text style={styles.cardTitle}>System Status</Text>
        
        <View style={styles.statusRow}>
          <View style={[
            styles.statusChip,
            { backgroundColor: backendStatus === 'connected' ? '#e8f5e8' : '#ffeaea' }
          ]}>
            <Text style={styles.chipText}>
              {backendStatus === 'connected' ? '✅' : '❌'} Backend API
            </Text>
          </View>
          <Text style={styles.statusText}>
            {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.statusChip}>
            <Text style={styles.chipText}>🐳 Docker</Text>
          </View>
          <Text style={styles.statusText}>
            PostgreSQL + Spring Boot
          </Text>
        </View>
        
        <Text style={styles.apiUrl}>
          🔗 http://192.168.1.46:8080/api
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
    textAlign: 'center',
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6200EE',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#6200EE',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
  },
  apiUrl: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e53e3e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#e53e3e',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen; 