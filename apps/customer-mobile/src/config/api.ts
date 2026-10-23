import Constants from 'expo-constants';

const getDevServerIp = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }
  return '192.168.1.63';
};

// Public production/cloud tunnel for APK sharing across any network
const NGROK_PUBLIC_URL = 'https://siren-planner-blizzard.ngrok-free.dev/api/v1';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || NGROK_PUBLIC_URL;
