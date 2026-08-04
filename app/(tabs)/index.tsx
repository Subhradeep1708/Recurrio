import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";

import { styled } from 'nativewind';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-5xl font-sans-extrabold text-primary ">
        Home
      </Text>
      <Link href="/onboarding" className="mt-4 font-sans-semibold rounded bg-primary text-white p-4">GO</Link>
      <Link href="/(auth)/sign-in" className="mt-4 font-sans-semibold rounded bg-primary text-white p-4">GO Signin</Link>
      <Link href="/(auth)/sign-up" className="mt-4 font-sans-semibold rounded bg-primary text-white p-4">GO Signup</Link>
      <Link href="/(auth)/sign-up" className="mt-4 font-sans-semibold rounded bg-primary text-white p-4">GO Signup</Link>



      <Link href={{
        pathname: "/subscriptions/[id]",
        params: { id: "spotify" }
      }}
        className="mt-4 rounded bg-primary text-white p-4">Spotify</Link>
      <Link href={{
        pathname: "/subscriptions/[id]",
        params: { id: "claude" }
      }}
        className="mt-4 rounded bg-primary text-white p-4">Claude</Link>



    </SafeAreaView>
  );
}