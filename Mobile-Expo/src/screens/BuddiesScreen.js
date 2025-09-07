import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBuddies, fetchRecommendations, requestBuddy } from '../store/buddySlice';

const BuddiesScreen = () => {
  const dispatch = useDispatch();
  const { buddies, recommendations, loading } = useSelector(state => state.buddy);
  const [activeTab, setActiveTab] = useState('buddies');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchBuddies());
    dispatch(fetchRecommendations());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const handleRequestBuddy = async (goalId) => {
    try {
      await dispatch(requestBuddy(goalId)).unwrap();
      Alert.alert('Success', 'Buddy request sent!');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to send request');
    }
  };

  const renderBuddy = ({ item }) => (
    <View style={styles.buddyCard}>
      <Text style={styles.buddyName}>
        {item.buddy?.firstName} {item.buddy?.lastName}
      </Text>
      <Text style={styles.buddyUsername}>@{item.buddy?.username}</Text>
      <Text style={styles.goalTitle}>Goal: {item.goal?.title}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          💯 {item.compatibilityScore || 0}%
        </Text>
        <Text style={styles.metaText}>
          📅 {item.daysActive || 0} days
        </Text>
      </View>
    </View>
  );

  const renderRecommendation = ({ item }) => (
    <View style={styles.recommendationCard}>
      <Text style={styles.goalTitle}>{item.goal?.title}</Text>
      <Text style={styles.goalDescription}>{item.goal?.description}</Text>
      <Text style={styles.ownerName}>
        👤 {item.goalOwner?.firstName} {item.goalOwner?.lastName}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          💯 {item.compatibilityScore || 0}%
        </Text>
        <Text style={styles.metaText}>
          📅 {item.daysRemaining || 0} days left
        </Text>
      </View>
      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => handleRequestBuddy(item.goal?.id)}>
        <Text style={styles.requestButtonText}>Request Buddy</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buddies' && styles.activeTab]}
          onPress={() => setActiveTab('buddies')}>
          <Text style={[styles.tabText, activeTab === 'buddies' && styles.activeTabText]}>
            My Buddies ({buddies.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
          onPress={() => setActiveTab('recommendations')}>
          <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>
            Find Buddies ({recommendations.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'buddies' ? (
        buddies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No buddies yet!</Text>
            <Text style={styles.emptySubtext}>
              Check recommendations to find accountability partners
            </Text>
          </View>
        ) : (
          <FlatList
            data={buddies}
            renderItem={renderBuddy}
            keyExtractor={item => item.relationshipId?.toString() || Math.random().toString()}
            style={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        recommendations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recommendations</Text>
            <Text style={styles.emptySubtext}>
              Create goals to get buddy recommendations
            </Text>
          </View>
        ) : (
          <FlatList
            data={recommendations}
            renderItem={renderRecommendation}
            keyExtractor={item => item.goal?.id?.toString() || Math.random().toString()}
            style={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          🔗 Backend: localhost:8080/api/buddies
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200EE',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  buddyCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
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
  recommendationCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buddyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  buddyUsername: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 5,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
    lineHeight: 20,
  },
  ownerName: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metaText: {
    fontSize: 12,
    color: '#888888',
  },
  requestButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  requestButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 12,
    color: '#888888',
  },
});

export default BuddiesScreen; 