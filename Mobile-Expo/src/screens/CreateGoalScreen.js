import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createGoal } from '../store/goalsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateGoalScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.goals);
  
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    category: 'FITNESS',
    type: 'HABIT',
    difficulty: 'MEDIUM',
    startDate: new Date().toISOString().split('T')[0], // Today's date
    targetDate: '',
    targetValue: '',
    targetUnit: '',
    isPublic: true,
    maxBuddies: 3,
  });

  const [errors, setErrors] = useState({});
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [targetDateObj, setTargetDateObj] = useState(new Date());

  const categories = [
    { value: 'FITNESS', label: '💪 Fitness', emoji: '💪' },
    { value: 'EDUCATION', label: '📚 Education', emoji: '📚' },
    { value: 'HOBBY', label: '🎨 Hobby', emoji: '🎨' },
    { value: 'CAREER', label: '💼 Career', emoji: '💼' },
    { value: 'HEALTH', label: '🏥 Health', emoji: '🏥' },
    { value: 'SOCIAL', label: '👫 Social', emoji: '👫' },
    { value: 'CREATIVE', label: '🎭 Creative', emoji: '🎭' },
    { value: 'SPIRITUAL', label: '🧘 Spiritual', emoji: '🧘' },
    { value: 'OTHER', label: '📝 Other', emoji: '📝' },
  ];

  const difficulties = [
    { value: 'EASY', label: '😊 Easy', color: '#4CAF50' },
    { value: 'MEDIUM', label: '😐 Medium', color: '#FF9800' },
    { value: 'HARD', label: '😤 Hard', color: '#F44336' },
    { value: 'EXPERT', label: '🔥 Expert', color: '#9C27B0' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!goalData.title.trim()) {
      newErrors.title = 'Goal title is required';
    } else if (goalData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (goalData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!goalData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else if (new Date(goalData.targetDate) <= new Date(goalData.startDate)) {
      newErrors.targetDate = 'Target date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGoal = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Debug: Check if we have a valid token
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔍 Auth Debug - Token exists:', !!token);
      console.log('🔍 Auth Debug - Token length:', token?.length || 0);
      
      // Format goal data before sending
      const formattedGoalData = {
        ...goalData,
        // Convert numeric fields properly
        targetValue: goalData.targetValue && goalData.targetValue.trim() !== '' 
          ? goalData.targetValue.trim() 
          : undefined,
        maxBuddies: Number(goalData.maxBuddies) || 3,
        isPublic: Boolean(goalData.isPublic)
      };
      
      // Remove undefined fields
      Object.keys(formattedGoalData).forEach(key => {
        if (formattedGoalData[key] === undefined || formattedGoalData[key] === '') {
          delete formattedGoalData[key];
        }
      });
      
      console.log('🔍 Auth Debug - Formatted goal data:', formattedGoalData);
      
      await dispatch(createGoal(formattedGoalData)).unwrap();
      Alert.alert(
        'Success!',
        'Your goal has been created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('🔍 Goal creation error:', error);
      Alert.alert('Error', error.message || 'Failed to create goal');
    }
  };

  const updateField = (field, value) => {
    setGoalData({ ...goalData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  // Date picker handlers
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDateObj(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateField('startDate', formattedDate);
    }
  };

  const onTargetDateChange = (event, selectedDate) => {
    setShowTargetDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTargetDateObj(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateField('targetDate', formattedDate);
    }
  };

  const showStartPicker = () => {
    setShowStartDatePicker(true);
  };

  const showTargetPicker = () => {
    setShowTargetDatePicker(true);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Goal</Text>
          <Text style={styles.headerSubtitle}>
            Set your goal and find accountability buddies
          </Text>
        </View>

        {/* Goal Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>🎯 Goal Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={goalData.title}
            onChangeText={(text) => updateField('title', text)}
            placeholder="e.g., Run 5km every day"
            maxLength={200}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Goal Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>📝 Description</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={goalData.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Describe your goal in detail..."
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Category Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>📂 Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.categoryButton,
                  goalData.category === category.value && styles.selectedCategory
                ]}
                onPress={() => updateField('category', category.value)}>
                <Text style={[
                  styles.categoryText,
                  goalData.category === category.value && styles.selectedCategoryText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>⚡ Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.value}
                style={[
                  styles.difficultyButton,
                  goalData.difficulty === difficulty.value && { 
                    backgroundColor: difficulty.color + '20',
                    borderColor: difficulty.color 
                  }
                ]}
                onPress={() => updateField('difficulty', difficulty.value)}>
                <Text style={[
                  styles.difficultyText,
                  goalData.difficulty === difficulty.value && { color: difficulty.color }
                ]}>
                  {difficulty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.dateContainer}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.label}>📅 Start Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showStartPicker}>
              <Text style={styles.dateButtonText}>
                {goalData.startDate || 'Select Start Date'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateInputContainer}>
            <Text style={styles.label}>🎯 Target Date *</Text>
            <TouchableOpacity
              style={[styles.dateButton, errors.targetDate && styles.inputError]}
              onPress={showTargetPicker}>
              <Text style={styles.dateButtonText}>
                {goalData.targetDate || 'Select Target Date'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            {errors.targetDate && <Text style={styles.errorText}>{errors.targetDate}</Text>}
          </View>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDateObj}
            mode="date"
            display="default"
            onChange={onStartDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTargetDatePicker && (
          <DateTimePicker
            value={targetDateObj}
            mode="date"
            display="default"
            onChange={onTargetDateChange}
            minimumDate={new Date(startDateObj.getTime() + 24 * 60 * 60 * 1000)} // Next day after start
          />
        )}

        {/* Target Value */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>📊 Target (Optional)</Text>
          <View style={styles.targetContainer}>
            <TextInput
              style={[styles.input, styles.targetInput]}
              value={goalData.targetValue}
              onChangeText={(text) => updateField('targetValue', text)}
              placeholder="e.g., 10000"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.targetInput]}
              value={goalData.targetUnit}
              onChangeText={(text) => updateField('targetUnit', text)}
              placeholder="e.g., steps, pages, hours"
            />
          </View>
          <Text style={styles.helpText}>
            💡 Enter a number for target value (e.g., 30 for 30 days, 5000 for 5000 steps)
          </Text>
        </View>

        {/* Max Buddies */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>👥 Max Buddies</Text>
          <View style={styles.buddyContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.buddyButton,
                  goalData.maxBuddies === num && styles.selectedBuddy
                ]}
                onPress={() => updateField('maxBuddies', num)}>
                <Text style={[
                  styles.buddyText,
                  goalData.maxBuddies === num && styles.selectedBuddyText
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Public/Private Toggle */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>🌐 Visibility</Text>
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                goalData.isPublic && styles.selectedVisibility
              ]}
              onPress={() => updateField('isPublic', true)}>
              <Text style={[
                styles.visibilityText,
                goalData.isPublic && styles.selectedVisibilityText
              ]}>
                🌐 Public
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                !goalData.isPublic && styles.selectedVisibility
              ]}
              onPress={() => updateField('isPublic', false)}>
              <Text style={[
                styles.visibilityText,
                !goalData.isPublic && styles.selectedVisibilityText
              ]}>
                🔒 Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateGoal}
          disabled={loading}>
          <Text style={styles.createButtonText}>
            {loading ? 'Creating Goal...' : '🎯 Create Goal'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#6200EE20',
    borderColor: '#6200EE',
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 14,
    color: '#666666',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  calendarIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  targetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  buddyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buddyButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBuddy: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  buddyText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
  },
  selectedBuddyText: {
    color: '#ffffff',
  },
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visibilityButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedVisibility: {
    backgroundColor: '#6200EE20',
    borderColor: '#6200EE',
  },
  visibilityText: {
    fontSize: 16,
    color: '#666666',
  },
  selectedVisibilityText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
    paddingHorizontal: 10,
  },
});

export default CreateGoalScreen; 