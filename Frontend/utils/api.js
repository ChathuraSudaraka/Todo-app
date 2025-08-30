import { Platform } from 'react-native';

export const resolveApiBase = () => {
  try {
    if (Platform.OS === 'android') {
      // For physical Android device, use your computer's IP address
      return 'http://10.146.238.252:8080/Backend';
    }
    if (Platform.OS === 'ios') {
      return 'http://localhost:8080/Backend';
    }
  } catch (e) {
    // Platform may be undefined in web environment
  }
  if (typeof window !== 'undefined' && window.location) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${window.location.hostname}${port}/Backend`;
  }
  // fallback
  return 'http://localhost:8080/Backend';
};

export const API_BASE = resolveApiBase();
console.log('API_BASE ->', API_BASE);
