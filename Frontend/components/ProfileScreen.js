import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen = ({ navigation, route }) => {
  const { userEmail } = route.params || {};
  
  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.removeItem('userEmail');
              navigation.replace('Login');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Feature Coming Soon', 'Account deletion will be available in a future update.');
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('Feature Coming Soon', 'Password change will be available in a future update.');
  };

  const handleExportData = () => {
    Alert.alert('Feature Coming Soon', 'Data export will be available in a future update.');
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Floating bubbles */}
        <View style={[styles.bubble, styles.bubble1]} />
        <View style={[styles.bubble, styles.bubble2]} />
        <View style={[styles.bubble, styles.bubble3]} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            </View>
            <Text style={styles.emailText}>{userEmail || 'user@example.com'}</Text>
            <Text style={styles.memberText}>Member since today</Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Text style={styles.menuIconText}>🔒</Text>
                </View>
                <Text style={styles.menuText}>Change Password</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Text style={styles.menuIconText}>📊</Text>
                </View>
                <Text style={styles.menuText}>Export Data</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Text style={styles.menuIconText}>🚪</Text>
                </View>
                <Text style={styles.menuText}>Logout</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.dangerItem]} onPress={handleDeleteAccount}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, styles.dangerIcon]}>
                  <Text style={styles.menuIconText}>🗑️</Text>
                </View>
                <Text style={[styles.menuText, styles.dangerText]}>Delete Account</Text>
              </View>
              <Text style={[styles.menuArrow, styles.dangerText]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
  },
  bubble1: {
    width: 120,
    height: 120,
    top: 100,
    right: -20,
  },
  bubble2: {
    width: 80,
    height: 80,
    top: 300,
    left: -30,
  },
  bubble3: {
    width: 60,
    height: 60,
    top: 500,
    right: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  memberText: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconText: {
    fontSize: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: '300',
  },
  dangerItem: {
    marginTop: 10,
  },
  dangerIcon: {
    backgroundColor: '#fee2e2',
  },
  dangerText: {
    color: '#dc2626',
  },
});

export default ProfileScreen;
