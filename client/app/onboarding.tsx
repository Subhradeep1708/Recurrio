import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const Onboarding = () => {
  const router = useRouter();
  const posthog = usePostHog();

  const handleContinue = () => {
    posthog?.capture('onboarding_completed');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <View className="flex-1 items-center justify-center">
        <View className="w-full rounded-3xl border border-border bg-card px-6 py-8">
          <Text className="text-center font-sans-bold text-2xl text-foreground">
            Finishing setup
          </Text>
          <Text className="mt-2 text-center font-sans-medium text-sm leading-6 text-foreground/70">
            Your account is ready. If Clerk places you here for a pending task, you can continue into the app after setup.
          </Text>

          <Pressable onPress={handleContinue} className="auth-button mt-6">
            <Text className="auth-button-text">Continue to app</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Onboarding