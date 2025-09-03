import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

function SignupScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // try creating user on backend first
      try {
        console.log('Signup: posting to', `${API_BASE}/api/users`);
        const signupBody = { username: email, password, email };
        console.log('Signup body ->', JSON.stringify(signupBody));
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signupBody)
        });
        const text = await res.text().catch(() => '');
        console.log('Signup response', res.status, text);
        if (res.ok) {
          const data = await res.json().catch(() => null);
          await AsyncStorage.setItem('currentUser', email);
          await AsyncStorage.setItem('currentUserId', data?.id?.toString() || '');
          navigation.replace('Todo');
          return;
        } else {
          let body = text || `Server returned ${res.status}`;
          Alert.alert('Signup failed', `Server ${res.status}: ${body}`);
          return;
        }
      } catch (e) {
        console.warn('Backend signup failed (network), falling back to local:', e);
      } finally {
        setLoading(false);
      }

      // fallback to local AsyncStorage
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : {};

      if (users[email]) {
        Alert.alert('Error', 'Email already exists');
        return;
      }

      users[email] = password;
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('currentUser', email);
      navigation.replace('Todo');
    } catch (error) {
      console.error('Signup unexpected error:', error);
      Alert.alert('Error', 'Signup failed');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#f8f9fa', '#e3f2fd', '#fce4ec']}
          locations={[0, 0.6, 1]}
          style={styles.background}
        >
          {/* Background bubbles */}
          <View style={[styles.bubble, styles.bubble1]} />
          <View style={[styles.bubble, styles.bubble2]} />
          <View style={[styles.bubble, styles.bubble3]} />
          <View style={[styles.bubble, styles.bubble4]} />
          
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us and start organizing</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkContainer}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>Already have an account? </Text>
                <Text style={styles.linkTextBold}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    minHeight: '100%',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  bubble1: {
    width: 200,
    height: 200,
    backgroundColor: '#8b5cf6',
    top: -100,
    right: -50,
  },
  bubble2: {
    width: 150,
    height: 150,
    backgroundColor: '#06b6d4',
    top: 100,
    left: -75,
  },
  bubble3: {
    width: 100,
    height: 100,
    backgroundColor: '#f59e0b',
    bottom: 200,
    right: 30,
  },
  bubble4: {
    width: 120,
    height: 120,
    backgroundColor: '#ef4444',
    bottom: -60,
    left: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
    minHeight: 600,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#6b7280',
  },
  linkTextBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
});

export default SignupScreen;
