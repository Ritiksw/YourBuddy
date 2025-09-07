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
import { fetchGoals } from '../store/goalsSlice';

const GoalsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { goals, loading } = useSelector(state => state.goals);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchGoals());
    setRefreshing(false);
  };

  const handleCreateGoal = () => {
    navigation.navigate('CreateGoal');
  };

  const handleGoalPress = (goal) => {
    navigation.navigate('GoalDetails', { goalId: goal.id });
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      FITNESS: '💪',
      EDUCATION: '📚',
      HOBBY: '🎨',
      CAREER: '💼',
      HEALTH: '🏥',
      SOCIAL: '👫',
      CREATIVE: '🎭',
      SPIRITUAL: '🧘',
      OTHER: '📝',
    };
    return emojiMap[category] || '📝';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      ACTIVE: '#4CAF50',
      COMPLETED: '#2196F3',
      PAUSED: '#FF9800',
      CANCELLED: '#F44336',
    };
    return colorMap[status] || '#666666';
  };

  const renderGoal = ({ item }) => (
    <TouchableOpacity 
      style={styles.goalCard}
      onPress={() => handleGoalPress(item)}
      activeOpacity={0.7}>
      
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{item.title}</Text>
        <Text style={[
          styles.goalStatus,
          { color: getStatusColor(item.status) }
        ]}>
          {item.status}
        </Text>
      </View>
      
      {item.description && (
        <Text style={styles.goalDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.goalMeta}>
        <Text style={styles.goalCategory}>
          {getCategoryEmoji(item.category)} {item.category}
        </Text>
        <Text style={styles.goalDifficulty}>
          ⚡ {item.difficulty || 'MEDIUM'}
        </Text>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${item.currentProgress || 0}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {item.currentProgress || 0}% Complete
        </Text>
      </View>

      {/* Goal Timeline */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineText}>
          📅 {item.startDate} → {item.targetDate}
        </Text>
        {item.daysRemaining && (
          <Text style={styles.daysRemaining}>
            {item.daysRemaining} days left
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateGoal}>
          <Text style={styles.addButtonText}>+ Add Goal</Text>
        </TouchableOpacity>
      </View>

      {(!goals || goals.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>No goals yet!</Text>
          <Text style={styles.emptySubtext}>
            Create your first goal to find accountability buddies
          </Text>
          <TouchableOpacity
            style={styles.createFirstGoalButton}
            onPress={handleCreateGoal}>
            <Text style={styles.createFirstGoalText}>🎯 Create Your First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          style={styles.goalsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          🔗 Backend: localhost:8080/api/goals
        </Text>
        <Text style={styles.statusText}>
          Total Goals: {goals?.length || 0}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  goalStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalCategory: {
    fontSize: 12,
    color: '#888888',
  },
  goalDifficulty: {
    fontSize: 12,
    color: '#888888',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6200EE',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineText: {
    fontSize: 12,
    color: '#888888',
  },
  daysRemaining: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
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
    marginBottom: 30,
  },
  createFirstGoalButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createFirstGoalText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginBottom: 2,
  },
});

export default GoalsScreen; 