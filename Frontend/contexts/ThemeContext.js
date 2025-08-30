import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = {
    isDark: isDarkMode,
    colors: isDarkMode ? darkTheme : lightTheme,
    toggleTheme,
  };

  if (isLoading) {
    return null; // Or a loading component
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightTheme = {
  // Background colors
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceVariant: '#f1f3f4',

  // Primary colors
  primary: '#667eea',
  primaryVariant: '#5a67d8',
  secondary: '#764ba2',
  secondaryVariant: '#f093fb',

  // Text colors
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#ffffff',

  // Border and divider
  border: '#e9ecef',
  divider: '#dee2e6',

  // Status colors
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',

  // Shadows
  shadowColor: '#000000',
  shadowOpacity: 0.1,

  // Card colors
  cardBackground: '#ffffff',
  cardBorder: '#e9ecef',

  // Input colors
  inputBackground: '#f8f9fa',
  inputBorder: '#e9ecef',
  inputPlaceholder: '#999999',

  // Button colors
  buttonPrimary: '#667eea',
  buttonSecondary: '#764ba2',
  buttonDisabled: '#cccccc',
};

const darkTheme = {
  // Background colors
  background: '#121212',
  surface: '#1e1e1e',
  surfaceVariant: '#2a2a2a',

  // Primary colors
  primary: '#667eea',
  primaryVariant: '#5a67d8',
  secondary: '#764ba2',
  secondaryVariant: '#f093fb',

  // Text colors
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#808080',
  textInverse: '#121212',

  // Border and divider
  border: '#404040',
  divider: '#333333',

  // Status colors
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',

  // Shadows
  shadowColor: '#000000',
  shadowOpacity: 0.3,

  // Card colors
  cardBackground: '#1e1e1e',
  cardBorder: '#404040',

  // Input colors
  inputBackground: '#2a2a2a',
  inputBorder: '#404040',
  inputPlaceholder: '#808080',

  // Button colors
  buttonPrimary: '#667eea',
  buttonSecondary: '#764ba2',
  buttonDisabled: '#555555',
};
