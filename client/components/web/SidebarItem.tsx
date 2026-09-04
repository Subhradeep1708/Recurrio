import { Animated, Image, Pressable, Text } from "react-native";
import { useEffect, useRef } from "react";
import { clsx } from "clsx";

const SidebarItem = ({
    tab,
    focused,
    collapsed,
    onPress,
}: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: focused ? 1.18 : 1,
            useNativeDriver: true,
        }).start();
    }, [focused]);

    return (
        <Pressable
            onPress={onPress}
            className={clsx(
                "h-12 flex-row items-center rounded-xl",
                collapsed ? "justify-center px-0" : "px-3",
                focused && "bg-primary"
            )}
        >
            <Animated.View
                style={{
                    transform: [{ scale }],
                }}
            >
                <Image
                    source={tab.icon}
                    resizeMode="contain"
                    style={{
                        width: 20,
                        height: 20,
                        tintColor: focused ? "#fff" : "#081126",
                    }}
                />
            </Animated.View>

            {!collapsed && (
                <Text
                    className={clsx(
                        "ml-3 font-sans-medium",
                        focused ? "text-white" : "text-primary"
                    )}
                >
                    {tab.title}
                </Text>
            )}
        </Pressable>
    );
};

export default SidebarItem;