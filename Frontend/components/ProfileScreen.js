import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const ProfileScreen = ({ navigation, route }) => {
  const { userEmail } = route.params || {};

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
    <LinearGradient colors={["#f8fafc", "#eef2ff"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert("Edit", "Edit profile coming soon")}
            >
              <Text style={styles.iconButtonText}>✎</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileTop}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
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

          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={handleChangePassword}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🔒</Text>
                <Text style={styles.rowText}>Change Password</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.row} onPress={handleExportData}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>📊</Text>
                <Text style={styles.rowText}>Export Data</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.row} onPress={handleLogout}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🚪</Text>
                <Text style={styles.rowText}>Logout</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
              <View style={styles.rowLeft}>
                <Text style={[styles.rowIcon, styles.dangerIcon]}>🗑️</Text>
                <Text style={[styles.rowText, styles.dangerText]}>
                  Delete Account
                </Text>
              </View>
              <Text style={[styles.rowArrow, styles.dangerText]}>›</Text>
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 52, // give extra space so content sits above the tab bar
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    elevation: 2,
  },
  iconButtonText: { fontSize: 18, color: "#374151" },
  screenTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  profileTop: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarLargeText: { color: "white", fontSize: 36, fontWeight: "700" },
  profileInfo: {},
  profileName: { fontSize: 18, fontWeight: "700", color: "#111827" },
  profileEmail: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  memberText: { fontSize: 12, color: "#9ca3af", marginTop: 6 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowIcon: { fontSize: 18, marginRight: 12 },
  rowText: { fontSize: 16, color: "#111827" },
  rowArrow: { color: "#9ca3af", fontSize: 18 },
  separator: { height: 1, backgroundColor: "#f3f4f6" },
  dangerIcon: { color: "#dc2626" },
  dangerText: { color: "#dc2626" },
});

export default ProfileScreen;
