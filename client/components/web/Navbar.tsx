import { Pressable, Text, View } from "react-native";

type NavbarProps = {
    collapsed: boolean;
    onToggle: () => void;
};

const Navbar = ({ collapsed, onToggle }: NavbarProps) => {
    return (
        <View
            style={{
                height: 64,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0,0,0,0.1)",
                backgroundColor: "#fff9e3",
            }}
        >
            <Pressable onPress={onToggle}>
                <Text style={{ fontSize: 24 }}>
                    ☰
                </Text>
            </Pressable>

            <Text
                style={{
                    marginLeft: 20,
                    fontSize: 20,
                    fontWeight: "600",
                }}
            >
                Recurrio
            </Text>
        </View>
    );
};

export default Navbar;