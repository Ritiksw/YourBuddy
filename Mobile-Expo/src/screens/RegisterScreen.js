import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(registerUser(formData)).unwrap();
      Alert.alert(
        'Success',
        'Registration successful! Please login with your credentials.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      // Error is handled by Redux state
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Create Your Account</Title>

            <TextInput
              label="Username *"
              value={formData.username}
              onChangeText={(text) => {
                setFormData({ ...formData, username: text });
                if (errors.username) {
                  setErrors({ ...errors, username: null });
                }
              }}
              style={styles.input}
              autoCapitalize="none"
              disabled={loading}
              error={!!errors.username}
              left={<TextInput.Icon icon="account" />}
            />
            <HelperText type="error" visible={!!errors.username}>
              {errors.username}
            </HelperText>

            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) {
                  setErrors({ ...errors, email: null });
                }
              }}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={loading}
              error={!!errors.email}
              left={<TextInput.Icon icon="email" />}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="First Name *"
              value={formData.firstName}
              onChangeText={(text) => {
                setFormData({ ...formData, firstName: text });
                if (errors.firstName) {
                  setErrors({ ...errors, firstName: null });
                }
              }}
              style={styles.input}
              disabled={loading}
              error={!!errors.firstName}
              left={<TextInput.Icon icon="account-outline" />}
            />
            <HelperText type="error" visible={!!errors.firstName}>
              {errors.firstName}
            </HelperText>

            <TextInput
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(text) => {
                setFormData({ ...formData, lastName: text });
                if (errors.lastName) {
                  setErrors({ ...errors, lastName: null });
                }
              }}
              style={styles.input}
              disabled={loading}
              error={!!errors.lastName}
              left={<TextInput.Icon icon="account-outline" />}
            />
            <HelperText type="error" visible={!!errors.lastName}>
              {errors.lastName}
            </HelperText>

            <TextInput
              label="Password *"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) {
                  setErrors({ ...errors, password: null });
                }
              }}
              style={styles.input}
              secureTextEntry
              disabled={loading}
              error={!!errors.password}
              left={<TextInput.Icon icon="lock" />}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={loading}
              disabled={loading}>
              Create Account
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
              disabled={loading}>
              Already have an account? Login
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 30,
  },
  input: {
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    marginBottom: 15,
    paddingVertical: 5,
  },
  linkButton: {
    marginTop: 10,
  },
});

export default RegisterScreen; 