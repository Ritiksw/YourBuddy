import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Button, Card, Avatar } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, getCurrentUser } from '../store/authSlice';
import Toast from 'react-native-toast-message';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Load user profile on mount
    dispatch(getCurrentUser());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(getCurrentUser()).unwrap();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to refresh user data',
      });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Goodbye!',
        text2: 'You have been logged out successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to logout',
      });
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || user?.username?.charAt(0).toUpperCase() || '?';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Button
            title="Logout"
            onPress={handleLogout}
            buttonStyle={styles.logoutButton}
            titleStyle={styles.logoutButtonText}
            type="outline"
          />
        </View>

        {user && (
          <Card containerStyle={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Avatar
                rounded
                title={getInitials(user.firstName, user.lastName)}
                size="large"
                overlayContainerStyle={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.welcomeText}>
                  Welcome back, {user.firstName || user.username}!
                </Text>
                <Text style={styles.emailText}>{user.email}</Text>
                <Text style={styles.roleText}>Role: {user.role}</Text>
              </View>
            </View>
          </Card>
        )}

        <Card containerStyle={styles.featuresCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <Button
              title="Profile Settings"
              buttonStyle={[styles.actionButton, styles.primaryButton]}
              titleStyle={styles.actionButtonText}
              onPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'Coming Soon',
                  text2: 'Profile settings will be available soon',
                });
              }}
            />
            
            <Button
              title="Notifications"
              buttonStyle={[styles.actionButton, styles.secondaryButton]}
              titleStyle={styles.actionButtonText}
              onPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'Coming Soon',
                  text2: 'Notifications feature will be available soon',
                });
              }}
            />
          </View>
        </Card>

        <Card containerStyle={styles.statsCard}>
          <Text style={styles.cardTitle}>App Statistics</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1.0.0</Text>
              <Text style={styles.statLabel}>Version</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>React Native</Text>
              <Text style={styles.statLabel}>Frontend</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>Spring Boot</Text>
              <Text style={styles.statLabel}>Backend</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    borderColor: '#dc3545',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    color: '#dc3545',
    fontSize: 14,
  },
  profileCard: {
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#007AFF',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  roleText: {
    fontSize: 12,
    color: '#007AFF',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  featuresCard: {
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCard: {
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    borderRadius: 20,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen; 