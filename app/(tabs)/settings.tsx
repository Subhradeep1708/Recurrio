import { useAuth, useUser } from '@clerk/expo';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import images from '@/constants/images';

const SafeAreaView = styled(RNSafeAreaView);

const preferenceItems = [
  {
    label: 'Push notifications',
    description: 'Get reminders for renewals and billing updates.',
    value: true,
    onValueChange: () => undefined,
  },
  {
    label: 'Email alerts',
    description: 'Receive product updates and security notices.',
    value: true,
    onValueChange: () => undefined,
  },
] as const;

const supportItems = [
  {
    label: 'Privacy policy',
    description: 'Review how your account data is handled.',
    onPress: () => Linking.openURL('https://example.com/privacy'),
  },
  {
    label: 'Terms of service',
    description: 'Read the terms that govern your account.',
    onPress: () => Linking.openURL('https://example.com/terms'),
  },
  {
    label: 'Help and support',
    description: 'Contact support for billing or account issues.',
    onPress: () => Linking.openURL('mailto:support@recurrio.com'),
  },
] as const;

const Settings = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const { isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;
  const fullName = user?.fullName?.trim() || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'Recurrio user';
  const emailAddress = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || 'No email linked';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recently';
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleLogout = async () => {
    if (!isLoaded) {
      return;
    }

    setIsLoggingOut(true);

    try {
      posthog?.capture('user_logged_out');
      posthog?.reset();
      await signOut();
      router.replace('/(auth)/sign-in');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <View className="mb-5">
          <Text className="text-2xl font-sans-bold text-foreground">Settings</Text>
          <Text className="mt-2 text-sm font-sans-medium text-foreground/60">
            Manage your account, notifications, and app preferences.
          </Text>
        </View>

        <View className="mb-4 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 text-xs font-sans-semibold uppercase tracking-[1px] text-foreground/55">
            Account details
          </Text>

          <View className="mb-5 flex-row items-center gap-4 rounded-2xl border border-border bg-background px-4 py-4">
            <Image source={avatarSource} className="size-16 rounded-full" />

            <View className="min-w-0 flex-1">
              <Text className="text-lg font-sans-bold text-foreground" numberOfLines={1}>
                {fullName}
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-foreground/60" numberOfLines={1}>
                {emailAddress}
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-sans-medium text-foreground/60">Name</Text>
              <Text className="max-w-[65%] text-right text-sm font-sans-bold text-foreground">{fullName}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-sans-medium text-foreground/60">Email</Text>
              <Text className="max-w-[65%] text-right text-sm font-sans-bold text-foreground">{emailAddress}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-sans-medium text-foreground/60">Member since</Text>
              <Text className="text-sm font-sans-bold text-foreground">{memberSince}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-sans-medium text-foreground/60">User ID</Text>
              <Text className="max-w-[65%] text-right text-sm font-sans-bold text-foreground" numberOfLines={1}>
                {user?.id || 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-4 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 text-xs font-sans-semibold uppercase tracking-[1px] text-foreground/55">
            Preferences
          </Text>

          <View className="gap-4">
            {preferenceItems.map((item) => (
              <View key={item.label} className="flex-row items-center justify-between gap-4">
                <View className="min-w-0 flex-1">
                  <Text className="text-base font-sans-bold text-foreground">{item.label}</Text>
                  <Text className="mt-1 text-sm font-sans-medium text-foreground/60">{item.description}</Text>
                </View>

                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: '#f6eecf', true: '#ea7a53' }}
                  thumbColor="#fff9e3"
                />
              </View>
            ))}
          </View>
        </View>

        <View className="mb-4 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 text-xs font-sans-semibold uppercase tracking-[1px] text-foreground/55">
            Support
          </Text>

          <View className="gap-3">
            {supportItems.map((item) => (
              <Pressable key={item.label} onPress={item.onPress} className="rounded-2xl border border-border bg-background px-4 py-4">
                <Text className="text-base font-sans-bold text-foreground">{item.label}</Text>
                <Text className="mt-1 text-sm font-sans-medium text-foreground/60">{item.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mb-4 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-4 text-xs font-sans-semibold uppercase tracking-[1px] text-foreground/55">
            App info
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-sans-medium text-foreground/60">Version</Text>
            <Text className="text-sm font-sans-bold text-foreground">{appVersion}</Text>
          </View>
        </View>

        <Pressable
          onPress={handleLogout}
          disabled={!isLoaded || isLoggingOut}
          className={isLoggingOut ? 'auth-button auth-button-disabled mb-16' : 'auth-button mb-16'}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#fff9e3" />
          ) : (
            <Text className="auth-button-text">Log out</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Settings