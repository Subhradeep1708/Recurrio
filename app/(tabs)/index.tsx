import "@/global.css";
import { FlatList, Image, Text, View } from "react-native";

import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from 'nativewind';
import { useState } from "react";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {

	const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

	return (
		<SafeAreaView  className="flex-1 bg-background p-5">
			{/* Inside All subscriptions Flatlist's header all top component goes so 1 vertical flatlist exists */}
				<FlatList
					ListHeaderComponent={() => (
						<>
							{/* header */}
							<View className="home-header">
								<View className="home-user">
									<Image source={images.avatar} className="home-avatar" />
									<Text className="home-user-name">{HOME_USER.name}</Text>
								</View>

								<Image source={icons.add} className="home-add-icon" />
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
									renderItem={({ item }) => <UpcomingSubscriptionCard data={item} />}
									keyExtractor={(item) => item.id}
									ListEmptyComponent={() => (
										<Text className="home-empty-state">No upcoming subscriptions</Text>
									)}
								/>
							</View>

							<ListHeading title="All Subscriptions" />

						</>
					)}

					data={HOME_SUBSCRIPTIONS}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) =>
						<SubscriptionCard
							{...item}
							expanded={expandedSubscriptionId === item.id}
							onPress={() => {
								setExpandedSubscriptionId((currentId) => (
									currentId === item.id ? null : item.id
								));
							}}
						/>
					}
					ListEmptyComponent={() => (
						<Text className="home-empty-state">No subscriptions yet.</Text>
					)}
					extraData={expandedSubscriptionId}
					ItemSeparatorComponent={() => <View className="h-4" />}
					showsVerticalScrollIndicator={false}
					contentContainerClassName="pb-20"
				/>
		</SafeAreaView>
	);
}