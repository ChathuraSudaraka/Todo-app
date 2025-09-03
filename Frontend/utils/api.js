import { Platform } from 'react-native';

export const resolveApiBase = () => {
  try {
    if (Platform.OS === 'android') {
      // Android Studio emulator (default) uses 10.0.2.2 to reach the host machine.
      // If you're using Genymotion use 10.0.3.2 instead.
      // If testing on a physical device, replace this with your PC's LAN IP (e.g. 192.168.x.y).
      return 'http://10.0.2.2:8080/Backend';
    }
    if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return 'http://localhost:8080/Backend';
    }
  } catch (e) {
    // Platform may be undefined in web environment
  }
  if (typeof window !== 'undefined' && window.location) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${window.location.hostname}${port}/Backend`;
  }
  // fallback (Expo on device or unexpected env) - adjust if you know the host IP
  return 'http://localhost:8080/Backend';
};

export const API_BASE = resolveApiBase();
console.log('API_BASE ->', API_BASE);
