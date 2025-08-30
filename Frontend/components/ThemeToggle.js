import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ style }) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const animation = React.useRef(new Animated.Value(isDark ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: isDark ? 1 : 0,
      tension: 65,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [isDark]);

  const handleToggle = () => {
    toggleTheme();
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 32],
  });

  const sunOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 0],
  });

  const moonOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 1],
  });

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }, style]}
      onPress={handleToggle}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: sunOpacity,
            transform: [{ scale: sunOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }) }],
          },
        ]}
      >
        <Ionicons name="sunny" size={18} color={colors.primary} />
      </Animated.View>

      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: moonOpacity,
            transform: [{ scale: moonOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }) }],
          },
        ]}
      >
        <Ionicons name="moon" size={18} color={colors.primary} />
      </Animated.View>

      <Animated.View
        style={[
          styles.slider,
          {
            backgroundColor: colors.primary,
            transform: [{ translateX }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    left: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default ThemeToggle;
