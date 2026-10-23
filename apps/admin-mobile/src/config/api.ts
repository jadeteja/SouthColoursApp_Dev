import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  // If explicitly configured in environment
  if (process.env.EXPO_PUBLIC_ADMIN_API_URL) {
    return process.env.EXPO_PUBLIC_ADMIN_API_URL;
  }

  // Running in Expo Go / Dev Client: derive the host IP dynamically from debugger host
  const debuggerHost = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:8080/api/v1`;
    }
  }

  // Primary development LAN IP for physical device connection
  return 'http://192.168.1.63:8080/api/v1';
};

export const API_BASE_URL = getBaseUrl();
