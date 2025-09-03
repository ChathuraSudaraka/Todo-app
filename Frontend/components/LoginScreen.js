import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../utils/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

function LoginScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // try backend authentication first
      try {
        const res = await fetch(`${API_BASE}/api/users/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          await AsyncStorage.setItem('currentUser', email);
          await AsyncStorage.setItem('currentUserId', data?.id?.toString() || '');
          navigation.replace('Todo');
          return;
        } else {
          let text = '';
          try { text = await res.text(); } catch (e) { text = String(e); }
          console.warn('Auth failed', res.status, text);
          Alert.alert('Login failed', `Server ${res.status}: ${text}`);
          return;
        }
      } catch (e) {
        console.warn('Backend auth failed, falling back to local:', e);
      }

      // fallback to local AsyncStorage-based users for offline/dev
      const storedUsers = await AsyncStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : {};

      if (users[email] && users[email] === password) {
        await AsyncStorage.setItem('currentUser', email);
        navigation.replace('Todo');
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
        
        <View style={styles.themeToggleContainer}>
          <ThemeToggle />
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Text style={styles.linkTextBold}>Sign up</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.demoText}>Demo credentials: admin@example.com / Pass123!@#</Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
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
  themeToggleContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 48,
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
    marginBottom: 24,
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
    marginTop: 8,
    marginBottom: 32,
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
  demoText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});

export default LoginScreen;
