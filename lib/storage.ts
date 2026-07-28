import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const memoryStore = new Map<string, string>();
const AUTH_SESSION_KEY = "auth_session";

function getPersistentStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return null;
}

export async function setItem(key: string, value: string, persist = false) {
  if (!persist) {
    memoryStore.set(key, value);
    return;
  }

  if (Platform.OS === "web") {
    const storage = getPersistentStorage();
    if (storage) {
      storage.setItem(key, value);
      return;
    }
  } else {
    try {
      if (await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
    } catch {
      // Fall back to in-memory storage when secure storage is unavailable.
    }
  }

  memoryStore.set(key, value);
}

export async function getItem(key: string) {
  if (memoryStore.has(key)) {
    return memoryStore.get(key) ?? null;
  }

  if (Platform.OS === "web") {
    const storage = getPersistentStorage();

    if (storage) {
      return storage.getItem(key) ?? null;
    }

    return null;
  }

  try {
    if (await SecureStore.isAvailableAsync()) {
      return await SecureStore.getItemAsync(key);
    }
  } catch {
    return null;
  }

  return null;
}

export async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    const storage = getPersistentStorage();

    if (storage) {
      storage.removeItem(key);
    }
  } else {
    try {
      if (await SecureStore.isAvailableAsync()) {
        await SecureStore.deleteItemAsync(key);
      }
    } catch {
      // Ignore delete failures and still clear in-memory value.
    }
  }

  memoryStore.delete(key);
}

export async function setAuthSession(user: {
  email: string;
  name?: string | null;
}) {
  await setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({
      authenticated: true,
      email: user.email,
      name: user.name ?? null,
    }),
    true,
  );
}

export async function getAuthSession() {
  const stored = await getItem(AUTH_SESSION_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export async function clearAuthSession() {
  await deleteItem(AUTH_SESSION_KEY);
}
