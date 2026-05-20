import { Screen } from "@/components/Screen";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <Screen className="flex-1 bg-white" withTabBarPadding>
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-medium text-primary">Profile</Text>
      </View>
    </Screen>
  );
}
