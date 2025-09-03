import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button, Input } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import Toast from 'react-native-toast-message';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
      });
      return false;
    }

    if (username.length < 3) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Username must be at least 3 characters long',
      });
      return false;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password must be at least 6 characters long',
      });
      return false;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Passwords do not match',
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid email address',
      });
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const { confirmPassword, ...registrationData } = formData;
      await dispatch(registerUser(registrationData)).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Registration Successful!',
        text2: 'You can now sign in with your credentials',
      });
      
      navigation.navigate('Login');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error || 'Please try again',
      });
    }
  };

  const navigateToLogin = () => {
    dispatch(clearError());
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Buddy community</Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Username *"
            value={formData.username}
            onChangeText={(value) => handleInputChange('username', value)}
            leftIcon={{ type: 'material', name: 'person' }}
            containerStyle={styles.inputContainer}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            placeholder="Email *"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            leftIcon={{ type: 'material', name: 'email' }}
            containerStyle={styles.inputContainer}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Input
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            leftIcon={{ type: 'material', name: 'badge' }}
            containerStyle={styles.inputContainer}
            autoCapitalize="words"
          />

          <Input
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            leftIcon={{ type: 'material', name: 'badge' }}
            containerStyle={styles.inputContainer}
            autoCapitalize="words"
          />

          <Input
            placeholder="Password *"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry={!showPassword}
            leftIcon={{ type: 'material', name: 'lock' }}
            rightIcon={{
              type: 'material',
              name: showPassword ? 'visibility' : 'visibility-off',
              onPress: () => setShowPassword(!showPassword),
            }}
            containerStyle={styles.inputContainer}
          />

          <Input
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            leftIcon={{ type: 'material', name: 'lock' }}
            rightIcon={{
              type: 'material',
              name: showConfirmPassword ? 'visibility' : 'visibility-off',
              onPress: () => setShowConfirmPassword(!showConfirmPassword),
            }}
            containerStyle={styles.inputContainer}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            buttonStyle={styles.registerButton}
            titleStyle={styles.buttonText}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Button
              title="Sign In"
              type="clear"
              onPress={navigateToLogin}
              titleStyle={styles.loginButton}
            />
          </View>
        </View>
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
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: '#28a745',
    borderRadius: 25,
    paddingVertical: 15,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 