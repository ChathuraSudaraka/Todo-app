import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Platform,
  Modal,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation, route }) => {
  const { userEmail } = route.params || {};
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;
  const menuItemAnims = [
    useRef(new Animated.Value(20)).current,
    useRef(new Animated.Value(20)).current,
    useRef(new Animated.Value(20)).current,
    useRef(new Animated.Value(20)).current
  ];
  
  // Load saved profile image on component mount
  useEffect(() => {
    loadProfileImage();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Staggered menu item animations
    Animated.stagger(100, menuItemAnims.map(anim => 
      Animated.timing(anim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    )).start();
  }, []);
  
  // Load profile image from storage
  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.log('Error loading profile image:', error);
    }
  };
  
  // Save profile image to storage
  const saveProfileImage = async (imageUri) => {
    try {
      await AsyncStorage.setItem('profileImage', imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.log('Error saving profile image:', error);
      Alert.alert('Error', 'Failed to save profile image');
    }
  };

  const handleLogout = async () => {
    try {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            // clear all stored user session keys
            await AsyncStorage.removeItem("userEmail");
            await AsyncStorage.removeItem("currentUser");
            await AsyncStorage.removeItem("currentUserId");
            navigation.replace("Login");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to logout");
    }
  };
  
  // Image picker functions
  const pickImageFromCamera = async () => {
    setShowImageOptions(false);
    
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }
    
    try {
      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const pickImageFromGallery = async () => {
    setShowImageOptions(false);
    
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to select photos');
      return;
    }
    
    try {
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await saveProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeProfileImage = async () => {
    setShowImageOptions(false);
    try {
      await AsyncStorage.removeItem('profileImage');
      setProfileImage(null);
      Alert.alert('Success', 'Profile picture removed');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove profile picture');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Feature Coming Soon",
              "Account deletion will be available in a future update."
            );
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Feature Coming Soon",
      "Password change will be available in a future update."
    );
  };

  const handleExportData = () => {
    Alert.alert(
      "Feature Coming Soon",
      "Data export will be available in a future update."
    );
  };

  return (
    <LinearGradient colors={["#4338ca", "#6366f1", "#818cf8"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert("Edit", "Edit profile coming soon")}
            >
              <Text style={styles.iconButtonText}>✎</Text>
            </TouchableOpacity>
          </View>

          <Animated.View 
            style={[
              styles.profileCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: cardAnim }]
              }
            ]}
          >
            <View style={styles.profileTop}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={() => setShowImageOptions(true)}
                disabled={isUploading}
              >
                {isUploading ? (
                  <View style={styles.avatarLarge}>
                    <ActivityIndicator size="large" color="#ffffff" />
                  </View>
                ) : profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLargeText}>
                      {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                    </Text>
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeText}>📷</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {userEmail ? userEmail.split("@")[0] : "User"}
                </Text>
                <Text style={styles.profileEmail}>
                  {userEmail || "user@example.com"}
                </Text>
                <Text style={styles.memberText}>Member since Sep 2025</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: cardAnim }]
              }
            ]}
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: menuItemAnims[0] }] }}>
              <TouchableOpacity style={styles.row} onPress={handleChangePassword}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowIcon}>🔒</Text>
                  <Text style={styles.rowText}>Change Password</Text>
                </View>
                <Text style={styles.rowArrow}>›</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.separator} />

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: menuItemAnims[1] }] }}>
              <TouchableOpacity style={styles.row} onPress={handleExportData}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowIcon}>📊</Text>
                  <Text style={styles.rowText}>Export Data</Text>
                </View>
                <Text style={styles.rowArrow}>›</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.separator} />

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: menuItemAnims[2] }] }}>
              <TouchableOpacity style={styles.row} onPress={handleLogout}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowIcon}>🚪</Text>
                  <Text style={styles.rowText}>Logout</Text>
                </View>
                <Text style={styles.rowArrow}>›</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.separator} />

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: menuItemAnims[3] }] }}>
              <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
                <View style={styles.rowLeft}>
                  <Text style={[styles.rowIcon, styles.dangerIcon]}>🗑️</Text>
                  <Text style={[styles.rowText, styles.dangerText]}>
                    Delete Account
                  </Text>
                </View>
                <Text style={[styles.rowArrow, styles.dangerText]}>›</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>

      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={0.9}
          onPress={() => setShowImageOptions(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent} 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Profile Picture</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={pickImageFromCamera}
            >
              <Text style={styles.modalOptionIcon}>📸</Text>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.modalOptionIcon}>🖼️</Text>
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            {profileImage && (
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={removeProfileImage}
              >
                <Text style={styles.modalOptionIcon}>🗑️</Text>
                <Text style={styles.modalOptionText}>Remove Photo</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 52,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconButtonText: { 
    fontSize: 20, 
    color: "#4338ca" 
  },
  screenTitle: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: "#ffffff",
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: 'hidden',
  },
  profileTop: { 
    flexDirection: "row", 
    alignItems: "center", 
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  avatarLargeText: { 
    color: "white", 
    fontSize: 42, 
    fontWeight: "700" 
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: "#ffffff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#667eea",
  },
  editBadgeText: {
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#1e293b",
    marginBottom: 4,
  },
  profileEmail: { 
    fontSize: 16, 
    color: "#475569", 
    marginBottom: 6,
  },
  memberText: { 
    fontSize: 14, 
    color: "#64748b", 
    marginTop: 4,
    fontStyle: "italic",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: 'hidden',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  rowLeft: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  rowIcon: { 
    fontSize: 20, 
    marginRight: 16 
  },
  rowText: { 
    fontSize: 16, 
    color: "#1e293b",
    fontWeight: "500",
  },
  rowArrow: { 
    color: "#94a3b8", 
    fontSize: 20,
    fontWeight: "600", 
  },
  separator: { 
    height: 1, 
    backgroundColor: "#f1f5f9" 
  },
  dangerIcon: { 
    color: "#ef4444" 
  },
  dangerText: { 
    color: "#ef4444" 
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  cancelOption: {
    marginTop: 8,
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  cancelText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProfileScreen;
