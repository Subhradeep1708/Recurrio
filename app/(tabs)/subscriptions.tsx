import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { subscriptions } = useSubscriptionStore();

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      subscription.name.toLowerCase().includes(query) ||
      (subscription.category?.toLowerCase() || "").includes(query) ||
      (subscription.plan?.toLowerCase() || "").includes(query)
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="px-5 pt-5">
            <Text className="text-3xl font-sans-bold text-primary mb-5">Subscriptions</Text>
            <TextInput
              className="bg-card rounded-2xl border border-border px-4 py-3.5 text-base font-sans-medium text-primary mb-4"
              placeholder="Search subscriptions..."
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View className="px-5 py-8 items-center">
            <Text className="text-sm font-sans-medium text-primary/60 text-center">
              {searchQuery.trim()
                ? `No subscriptions found matching "${searchQuery}"`
                : "No subscriptions yet."}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  )
}
export default Subscriptions