import { Redirect, Slot } from "expo-router";
import { useAuth } from "@clerk/expo";
import { View } from "react-native";
import { useState } from "react";

import Sidebar from "@/components/web/Sidebar";
import Navbar from "@/components/web/Navbar";

const WebLayout = () => {
    const { isLoaded, isSignedIn } = useAuth();

    const [collapsed, setCollapsed] = useState(false);

    if (!isLoaded) return null;

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />;
    }

    return (
        <View style={{ flex: 1, flexDirection: "row" }}>

            <Sidebar collapsed={collapsed} />

            <View style={{ flex: 1 }}>

                <Navbar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed((prev) => !prev)}
                />

                <View style={{ flex: 1 }}>
                    <Slot />
                </View>

            </View>

        </View>
    );
};

export default WebLayout;