import "@/global.css";
import { FlatList, Image, Pressable, Text, View } from "react-native";

import Subscriptions from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useSubscriptionStore } from "@/lib/SubscriptionStore";
import { formatCurrency } from "@/lib/utils";
import { useUser } from '@clerk/expo';
import dayjs from "dayjs";
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { useState } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {

	const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
	const { user } = useUser();
	const posthog = usePostHog();
	const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;
	const userName = user?.fullName?.trim() || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || HOME_USER.name;

	const [isModalVisible, setIsModalVisible] = useState(false);
	const { subscriptions, addSubscription, analyticsConsent } = useSubscriptionStore();

	const handleCreateSubscription = (newSubscription: Subscription) => {
		addSubscription(newSubscription);
		if (analyticsConsent) {
			posthog?.capture('subscription_created', {
				subscription_frequency: newSubscription.frequency,
				subscription_category: newSubscription.category ?? 'Other',
			});
		}
	};


	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Inside All subscriptions Flatlist's header all top component goes so 1 vertical flatlist exists */}
			<FlatList
				ListHeaderComponent={() => (
					<View className="px-5 pt-5">
						{/* header */}
						<View className="home-header">
							<View className="home-user">
								<Image source={avatarSource} className="home-avatar" />
								<Text className="home-user-name">{userName}</Text>
							</View>

							<Pressable 
								onPress={() => setIsModalVisible(true)}
								accessibilityRole="button"
								accessibilityLabel="Create subscription"
							>
								<Image source={icons.add} className="home-add-icon" />
							</Pressable>
						</View>

						{/* balance */}
						<View className="home-balance-card">
							<Text className="home-balance-label">Balance</Text>

							<View className="home-balance-row">
								<Text className="home-balance-amount">
									{formatCurrency(HOME_BALANCE.amount, 'INR')}
								</Text>
								<Text className="home-balance-date">
									{dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
								</Text>
							</View>
						</View>

						{/* upcoming subscriptions */}
						<View className="mb-5">
							<ListHeading title="Upcoming" />

							<FlatList
								data={UPCOMING_SUBSCRIPTIONS}
								horizontal
								showsHorizontalScrollIndicator={false}
								renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
								keyExtractor={(item) => item.id}
								ListEmptyComponent={() => (
									<Text className="home-empty-state">No upcoming subscriptions</Text>
								)}
							/>
						</View>

						<ListHeading title="All Subscriptions" />

					</View>
				)}

				data={subscriptions}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) =>
					<View className="px-5">
						<SubscriptionCard
							{...item}
							expanded={expandedSubscriptionId === item.id}
							onPress={() => {
								const isExpanding = expandedSubscriptionId !== item.id;
								if (analyticsConsent) {
									posthog?.capture('subscription_details_toggled', {
										subscription_id: item.id,
										action: isExpanding ? 'expanded' : 'collapsed',
									});
								}
								setExpandedSubscriptionId(isExpanding ? item.id : null);
							}}
						/>
					</View>
				}
				ListEmptyComponent={() => (
					<Text className="home-empty-state">No subscriptions yet.</Text>
				)}
				extraData={expandedSubscriptionId}
				ItemSeparatorComponent={() => <View className="h-4" />}
				showsVerticalScrollIndicator={false}
				contentContainerClassName="pb-30"
			/>

			<Subscriptions
				visible={isModalVisible}
				onClose={() => setIsModalVisible(false)}
				onSubmit={handleCreateSubscription}
			/>
		</SafeAreaView>
	);
}