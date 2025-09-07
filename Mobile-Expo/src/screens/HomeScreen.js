import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  Paragraph,
  Chip,
  Surface,
} from 'react-native-paper';
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
    dispatch(logout());
  };

  const activeGoals = goals.filter(goal => goal.status === 'ACTIVE');
  const completedGoals = goals.filter(goal => goal.status === 'COMPLETED');

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      
      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title style={styles.welcomeTitle}>
            Welcome back, {user?.firstName || user?.username}! 👋
          </Title>
          <Paragraph style={styles.welcomeSubtitle}>
            Ready to achieve your goals with your accountability buddies?
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{activeGoals.length}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </Surface>
        
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{buddies.length}</Text>
          <Text style={styles.statLabel}>Buddies</Text>
        </Surface>
        
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{completedGoals.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </Surface>
        
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </Surface>
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Goals')}
              icon="flag">
              View Goals
            </Button>
            
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Buddies')}
              icon="people">
              Find Buddies
            </Button>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Chat')}
              icon="chat">
              Chat {unreadCount > 0 && `(${unreadCount})`}
            </Button>
            
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile')}
              icon="person">
              Profile
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Backend Status */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>System Status</Title>
          
          <View style={styles.statusRow}>
            <Chip 
              icon={backendStatus === 'connected' ? 'check' : 'close'}
              style={[
                styles.statusChip,
                { backgroundColor: backendStatus === 'connected' ? '#e8f5e8' : '#ffeaea' }
              ]}>
              Backend API
            </Chip>
            <Text style={styles.statusText}>
              {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Chip icon="docker" style={styles.statusChip}>
              Docker
            </Chip>
            <Text style={styles.statusText}>
              PostgreSQL + Spring Boot
            </Text>
          </View>
          
          <Text style={styles.apiUrl}>
            🔗 http://localhost:8080/api
          </Text>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="text"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor="#e53e3e">
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeCard: {
    margin: 20,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
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
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 4,
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusChip: {
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  apiUrl: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
    marginTop: 10,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
});

export default HomeScreen; 