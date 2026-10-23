import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Permanent 24/7 Cloud Backend deployed on Render
const CLOUD_PUBLIC_URL = 'https://southcolours-backend.onrender.com/api/v1';

const getBaseUrl = (): string => {
  // If explicitly configured in environment
  if (process.env.EXPO_PUBLIC_ADMIN_API_URL && process.env.EXPO_PUBLIC_ADMIN_API_URL.trim() !== '') {
    return process.env.EXPO_PUBLIC_ADMIN_API_URL;
  }

  return CLOUD_PUBLIC_URL;
};

export const API_BASE_URL = getBaseUrl();
