import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  analyticsConsent: boolean;
  setAnalyticsConsent: (consent: boolean) => void;
}

const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
      return null;
    }
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Fallback
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
      }
      return;
    }
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Fallback
    }
  },
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      subscriptions: HOME_SUBSCRIPTIONS,
      addSubscription: (subscription) =>
        set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
      setSubscriptions: (subscriptions) => set({ subscriptions }),
      analyticsConsent: false,
      setAnalyticsConsent: (consent) => set({ analyticsConsent: consent }),
    }),
    {
      name: 'recurrio-subscription-store',
      storage: createJSONStorage(() => customStorage),
    }
  )
);