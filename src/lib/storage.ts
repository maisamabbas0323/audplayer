import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'audplayer.';

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can fail silently (quota, private mode); library still works this session.
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export const KEYS = {
  tracks: 'tracks',
  favorites: 'favorites',
  playlists: 'playlists',
  settings: 'settings',
  session: 'session',
  promptedScan: 'promptedScan',
} as const;