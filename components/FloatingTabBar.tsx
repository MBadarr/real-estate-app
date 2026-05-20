import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#0E4D92";
const MUTED = "#94A3B8";

const TAB_ICONS = {
  index: { default: "home-outline", selected: "home" },
  search: { default: "search-outline", selected: "search" },
  saved: { default: "heart-outline", selected: "heart" },
  profile: { default: "person-outline", selected: "person" },
} as const satisfies Record<
  string,
  { default: keyof typeof Ionicons.glyphMap; selected: keyof typeof Ionicons.glyphMap }
>;

type TabRouteName = keyof typeof TAB_ICONS;

export function FloatingTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-5 right-5 flex-row items-center justify-around rounded-full border border-slate-100 bg-white px-2 py-2.5"
      style={{
        bottom: insets.bottom + 12,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 14,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const icons = TAB_ICONS[route.name as TabRouteName];

        if (!icons) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            className={`items-center justify-center rounded-full px-5 py-2.5 ${
              isFocused ? "bg-primary/10" : ""
            }`}
          >
            <Ionicons
              name={isFocused ? icons.selected : icons.default}
              size={24}
              color={isFocused ? PRIMARY : MUTED}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
