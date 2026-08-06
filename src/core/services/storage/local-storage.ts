import AsyncStorage from "@react-native-async-storage/async-storage";

export const localStorage = {
  async get<T>(storageKey: string): Promise<T | null> {
    try {
      const storedJson = await AsyncStorage.getItem(storageKey);
      return storedJson ? (JSON.parse(storedJson) as T) : null;
    } catch {
      await AsyncStorage.removeItem(storageKey);
      return null;
    }
  },

  async set<T>(storageKey: string, storageValue: T): Promise<void> {
    await AsyncStorage.setItem(storageKey, JSON.stringify(storageValue));
  },

  async remove(storageKey: string): Promise<void> {
    await AsyncStorage.removeItem(storageKey);
  },
};

export const STORAGE_KEYS = {
  LOGGED_USER: "@gpmobile:logged_user",
  MOCK_TICKETS: "@gpmobile:mock_tickets",
} as const;
