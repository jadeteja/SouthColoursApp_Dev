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

// Permanent 24/7 Cloud Backend deployed on Render
const CLOUD_PUBLIC_URL = 'https://southcolours-backend.onrender.com/api/v1';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || CLOUD_PUBLIC_URL;
