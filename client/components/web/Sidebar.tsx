import { tabs } from "@/constants/data";
import { Href, usePathname, useRouter } from "expo-router";
import {
    Animated,
    Easing,
    Image,
    Pressable,
    Text,
    View,
} from "react-native";
import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import SidebarItem from "./SidebarItem";

type SidebarProps = {
    collapsed: boolean;
};

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 80;

const Sidebar = ({ collapsed }: SidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();

    // Animated sidebar width
    const width = useRef(
        new Animated.Value(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH)
    ).current;

    useEffect(() => {
        Animated.timing(width, {
            toValue: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [collapsed]);

    const handleNavigation = (name: string) => {
        const href =
            name === "index"
                ? "/(tabs)"
                : `/(tabs)/${name}`;

        router.push(href as Href);
    };

    const isActive = (name: string) => {
        if (name === "index") {
            return pathname === "/";
        }

        return pathname.includes(`/${name}`);
    };

    return (
        <Animated.View
            style={{
                width,
                borderRightWidth: 1,
                borderRightColor: "rgba(0,0,0,0.1)",
                backgroundColor: "#fff9e3",
            }}
            className="h-full px-4 py-5"
        >
            {/* Logo */}
            <View
                className={clsx(
                    "h-8 flex-row",
                    collapsed ? "items-center justify-center" : "items-start gap-3"
                )}
            >
                <Image
                    source={require("@/assets/icons/logo.png")}
                    resizeMode="contain"
                    style={{
                        width: 32,
                        height: 32,
                    }}
                />
                <Text className="text-[22px] font-bold">
                    {collapsed ? "" : "Recurrio"}
                </Text>
            </View>

            {/* Navigation */}
            <View className="mt-10 gap-2">
                {tabs.map((tab) => {
                    const focused = isActive(tab.name);

                    return (
                        <SidebarItem
                            key={tab.name}
                            tab={tab}
                            focused={focused}
                            collapsed={collapsed}
                            onPress={() => handleNavigation(tab.name)}
                        />
                    );
                })}
            </View>
        </Animated.View>
    );
};

export default Sidebar;