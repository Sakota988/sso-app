import { Platform } from 'react-native';

const DEFAULT_IOS = 'http://localhost:3001';
const DEFAULT_ANDROID = 'http://10.0.2.2:3001';

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return Platform.OS === 'android' ? DEFAULT_ANDROID : DEFAULT_IOS;
}
