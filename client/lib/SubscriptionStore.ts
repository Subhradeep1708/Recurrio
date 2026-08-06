import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      // Fallback
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
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
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return persistedState;
      },
      partialize: (state) => ({
        subscriptions: state.subscriptions
          .filter((sub) => sub.id.startsWith('sub-'))
          .map((sub) => ({
            ...sub,
            icon: 'wallet',
          })),
        analyticsConsent: state.analyticsConsent,
      }),
      merge: (persistedState: any, currentState: SubscriptionStore) => {
        const persistedSubs = (persistedState?.subscriptions || []) as Subscription[];
        return {
          ...currentState,
          ...persistedState,
          subscriptions: [
            ...persistedSubs,
            ...HOME_SUBSCRIPTIONS,
          ],
        };
      },
    }
  )
);