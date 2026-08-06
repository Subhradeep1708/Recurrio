import { useLocalSearchParams, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { Text, View, Pressable, Image } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useSubscriptionStore } from '@/lib/SubscriptionStore';
import { icons, IconKey } from '@/constants/icons';
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils';

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { subscriptions } = useSubscriptionStore();
  const subscription = subscriptions.find((sub) => sub.id === id);

  if (!subscription) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-2 text-center font-sans-bold text-lg text-foreground">
          Subscription not found
        </Text>
        <Text className="mb-6 text-center font-sans-regular text-sm text-foreground/70">
          The requested subscription record does not exist or has been deleted.
        </Text>
        <Pressable 
          onPress={() => router.back()} 
          className="auth-button"
          accessibilityRole="button"
          accessibilityLabel="Go back to home"
        >
          <Text className="auth-button-text">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const resolvedIcon = typeof subscription.icon === 'string' ? (icons[subscription.icon as IconKey] || icons.wallet) : subscription.icon;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-border px-6 py-4">
        <Pressable 
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text className="font-sans-semibold text-base text-accent">Back</Text>
        </Pressable>
        <Text className="font-sans-bold text-lg text-foreground">Details</Text>
        <View className="w-10" />
      </View>

      <View className="items-center px-6 py-8">
        <View 
          className="h-20 w-20 items-center justify-center rounded-3xl"
          style={{ backgroundColor: subscription.color || '#081126' }}
        >
          <Image source={resolvedIcon} className="h-12 w-12" style={{ tintColor: '#fff9e3' }} />
        </View>
        <Text className="mt-4 font-sans-bold text-2xl text-foreground">{subscription.name}</Text>
        {subscription.plan ? (
          <Text className="mt-1 font-sans-medium text-sm text-foreground/60">{subscription.plan}</Text>
        ) : null}
        
        <Text className="mt-6 font-sans-extrabold text-4xl text-foreground">
          {formatCurrency(subscription.price, subscription.currency)}
        </Text>
        <Text className="mt-1 font-sans-semibold text-xs text-foreground/50 uppercase tracking-wider">
          Billed {subscription.frequency}
        </Text>
      </View>

      <View className="mx-6 rounded-3xl border border-border bg-card p-5 gap-4">
        <View className="flex-row justify-between items-center">
          <Text className="font-sans-medium text-sm text-foreground/50">Category</Text>
          <Text className="font-sans-semibold text-sm text-foreground">{subscription.category || 'N/A'}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="font-sans-medium text-sm text-foreground/50">Status</Text>
          <Text className="font-sans-semibold text-sm text-foreground">{formatStatusLabel(subscription.status)}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="font-sans-medium text-sm text-foreground/50">Start Date</Text>
          <Text className="font-sans-semibold text-sm text-foreground">
            {formatSubscriptionDateTime(subscription.startDate, subscription.currency)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="font-sans-medium text-sm text-foreground/50">Next Renewal</Text>
          <Text className="font-sans-semibold text-sm text-foreground">
            {formatSubscriptionDateTime(subscription.renewalDate, subscription.currency)}
          </Text>
        </View>
        {subscription.paymentMethod ? (
          <View className="flex-row justify-between items-center">
            <Text className="font-sans-medium text-sm text-foreground/50">Payment Method</Text>
            <Text className="font-sans-semibold text-sm text-foreground">{subscription.paymentMethod}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionDetails;