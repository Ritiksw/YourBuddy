import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { goalsAPI } from '../services/api';

const GoalsScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalsAPI.getGoals();
      setGoals(response.goals || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const renderGoal = ({ item }) => (
    <View style={styles.goalCard}>
      <Text style={styles.goalTitle}>{item.title}</Text>
      <Text style={styles.goalDescription}>{item.description}</Text>
      <View style={styles.goalMeta}>
        <Text style={styles.goalCategory}>📂 {item.category}</Text>
        <Text style={styles.goalStatus}>🎯 {item.status}</Text>
      </View>
      <View style={styles.goalProgress}>
        <Text style={styles.progressText}>
          Progress: {item.currentProgress || 0}%
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Coming Soon', 'Goal creation screen')}>
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading goals...</Text>
        </View>
      ) : goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No goals yet!</Text>
          <Text style={styles.emptySubtext}>
            Create your first goal to find accountability buddies
          </Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={item => item.id.toString()}
          style={styles.goalsList}
          refreshing={loading}
          onRefresh={fetchGoals}
        />
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          🔗 Connected to Docker Backend (localhost:8080)
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  goalsList: {
    flex: 1,
    padding: 20,
  },
  goalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalCategory: {
    fontSize: 12,
    color: '#888',
  },
  goalStatus: {
    fontSize: 12,
    color: '#888',
  },
  goalProgress: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 8,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6200EE',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default GoalsScreen; 