import { FloatingTabBar } from "@/components/FloatingTabBar";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                sceneStyle: { backgroundColor: "#ffffff" },
            }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="search" />
            <Tabs.Screen name="saved" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}
