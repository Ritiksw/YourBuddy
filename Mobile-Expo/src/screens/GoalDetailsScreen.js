import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateGoal, deleteGoal, setSelectedGoal } from '../store/goalsSlice';

const GoalDetailsScreen = ({ route, navigation }) => {
  const { goalId } = route.params;
  const dispatch = useDispatch();
  const { goals, loading, selectedGoal } = useSelector(state => state.goals);
  
  const [goal, setGoal] = useState(null);

  useEffect(() => {
    const foundGoal = goals.find(g => g.id === goalId);
    if (foundGoal) {
      setGoal(foundGoal);
      dispatch(setSelectedGoal(foundGoal));
    }
  }, [goalId, goals, dispatch]);

  const handleEditGoal = () => {
    navigation.navigate('EditGoal', { goalId });
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteGoal(goalId)).unwrap();
              Alert.alert('Success', 'Goal deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete goal');
            }
          }
        }
      ]
    );
  };

  const markProgress = (progress) => {
    Alert.alert(
      'Update Progress',
      `Mark goal as ${progress}% complete?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await dispatch(updateGoal({ 
                goalId, 
                goalData: { currentProgress: progress } 
              })).unwrap();
              Alert.alert('Success', 'Progress updated!');
            } catch (error) {
              Alert.alert('Error', error || 'Failed to update progress');
            }
          }
        }
      ]
    );
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

  const getDifficultyColor = (difficulty) => {
    const colorMap = {
      EASY: '#4CAF50',
      MEDIUM: '#FF9800',
      HARD: '#F44336',
      EXPERT: '#9C27B0',
    };
    return colorMap[difficulty] || '#666666';
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

  if (!goal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading goal...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <View style={styles.goalMeta}>
          <Text style={styles.categoryBadge}>
            {getCategoryEmoji(goal.category)} {goal.category}
          </Text>
          <Text style={[
            styles.statusBadge,
            { color: getStatusColor(goal.status) }
          ]}>
            {goal.status}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Description */}
        {goal.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Description</Text>
            <Text style={styles.description}>{goal.description}</Text>
          </View>
        )}

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${goal.currentProgress || 0}%` }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {goal.currentProgress || 0}% Complete
            </Text>
          </View>
          
          {/* Quick Progress Buttons */}
          <View style={styles.progressButtons}>
            {[25, 50, 75, 100].map((progress) => (
              <TouchableOpacity
                key={progress}
                style={styles.progressButton}
                onPress={() => markProgress(progress)}>
                <Text style={styles.progressButtonText}>{progress}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Timeline</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date:</Text>
            <Text style={styles.detailValue}>{goal.startDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target Date:</Text>
            <Text style={styles.detailValue}>{goal.targetDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Days Remaining:</Text>
            <Text style={styles.detailValue}>{goal.daysRemaining || 'N/A'}</Text>
          </View>
        </View>

        {/* Goal Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Difficulty:</Text>
            <Text style={[
              styles.detailValue,
              { color: getDifficultyColor(goal.difficulty) }
            ]}>
              {goal.difficulty}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Max Buddies:</Text>
            <Text style={styles.detailValue}>{goal.maxBuddies || 3}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Visibility:</Text>
            <Text style={styles.detailValue}>
              {goal.isPublic ? '🌐 Public' : '🔒 Private'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditGoal}>
            <Text style={styles.editButtonText}>✏️ Edit Goal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteGoal}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Goal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200EE',
    textAlign: 'center',
  },
  progressButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  progressButton: {
    backgroundColor: '#6200EE20',
    borderWidth: 1,
    borderColor: '#6200EE',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressButtonText: {
    color: '#6200EE',
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    marginBottom: 5,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#6200EE',
    flex: 1,
    marginRight: 10,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    flex: 1,
    marginLeft: 10,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GoalDetailsScreen; 