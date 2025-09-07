import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBuddies, fetchRecommendations, requestBuddy } from '../store/buddySlice';

const BuddiesScreen = () => {
  const dispatch = useDispatch();
  const { buddies, recommendations, loading } = useSelector(state => state.buddy);
  const [activeTab, setActiveTab] = useState('buddies');

  useEffect(() => {
    dispatch(fetchBuddies());
    dispatch(fetchRecommendations());
  }, [dispatch]);

  const handleRequestBuddy = async (goalId) => {
    try {
      await dispatch(requestBuddy(goalId)).unwrap();
      Alert.alert('Success', 'Buddy request sent!');
    } catch (error) {
      Alert.alert('Error', error);
    }
  };

  const renderBuddy = ({ item }) => (
    <View style={styles.buddyCard}>
      <Text style={styles.buddyName}>
        {item.buddy.firstName} {item.buddy.lastName}
      </Text>
      <Text style={styles.buddyUsername}>@{item.buddy.username}</Text>
      <Text style={styles.goalTitle}>Goal: {item.goal.title}</Text>
      <View style={styles.buddyMeta}>
        <Text style={styles.metaText}>
          💯 Compatibility: {item.compatibilityScore}%
        </Text>
        <Text style={styles.metaText}>
          📅 Days Active: {item.daysActive}
        </Text>
      </View>
    </View>
  );

  const renderRecommendation = ({ item }) => (
    <View style={styles.recommendationCard}>
      <Text style={styles.goalTitle}>{item.goal.title}</Text>
      <Text style={styles.goalDescription}>{item.goal.description}</Text>
      <Text style={styles.ownerName}>
        👤 {item.goalOwner.firstName} {item.goalOwner.lastName}
      </Text>
      <View style={styles.recommendationMeta}>
        <Text style={styles.metaText}>
          💯 Match: {item.compatibilityScore}%
        </Text>
        <Text style={styles.metaText}>
          📅 {item.daysRemaining} days left
        </Text>
      </View>
      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => handleRequestBuddy(item.goal.id)}>
        <Text style={styles.requestButtonText}>Request as Buddy</Text>
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
            Recommendations ({recommendations.length})
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
            keyExtractor={item => item.relationshipId.toString()}
            style={styles.list}
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
            keyExtractor={item => item.goal.id.toString()}
            style={styles.list}
          />
        )
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          🔗 Buddy API: http://localhost:8080/api/buddies
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200EE',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    padding: 20,
  },
  buddyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6200EE',
  },
  buddyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  buddyUsername: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
    marginBottom: 10,
  },
  ownerName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  buddyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  requestButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 12,
    color: '#888',
  },
});

export default BuddiesScreen; 