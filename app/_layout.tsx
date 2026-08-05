import '@/global.css';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from 'react';
import { Text, View } from 'react-native';

SplashScreen.preventAutoHideAsync(); // Prevents the splash screen from auto-hiding before the fonts are loaded

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const [fontsLoaded, fontError] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (fontError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-center font-sans-bold text-lg text-foreground">
          Unable to load app fonts
        </Text>
        <Text className="text-center font-sans-regular text-sm text-foreground/70">
          Please restart the app. If the problem persists, check the bundled font files.
        </Text>
      </View>
    );
  }

  if (!publishableKey) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-center font-sans-bold text-lg text-foreground">
          Missing Clerk publishable key
        </Text>
        <Text className="text-center font-sans-regular text-sm text-foreground/70">
          Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env file and restart the app.
        </Text>
      </View>
    );
  }

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}
