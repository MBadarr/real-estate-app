import { useUserStore } from "@/store/userStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#0E4D92";
const MUTED = "#94A3B8";

const TAB_ICONS = {
  index: { default: "home-outline", selected: "home", label: "Home" },
  search: { default: "search-outline", selected: "search", label: "Search" },
  saved: { default: "heart-outline", selected: "heart", label: "Saved" },
  profile: { default: "person-outline", selected: "person", label: "Profile" },
  create: { default: "add-outline", selected: "add", label: "Add" },
} as const satisfies Record<
  string,
  { default: keyof typeof Ionicons.glyphMap; selected: keyof typeof Ionicons.glyphMap; label: string }
>;

type TabRouteName = keyof typeof TAB_ICONS;

function renderAndroidTab(
  route: BottomTabBarProps["state"]["routes"][number],
  index: number,
  state: BottomTabBarProps["state"],
  navigation: BottomTabBarProps["navigation"],
  isAdmin: boolean
) {
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
      className={`flex-1 items-center justify-center py-2 rounded-full ${
        isFocused ? "bg-primary/10" : ""
      }`}
      android_ripple={{ color: "rgba(14, 77, 146, 0.1)" }}
    >
      <Ionicons
        name={isFocused ? icons.selected : icons.default}
        size={24}
        color={isFocused ? PRIMARY : MUTED}
      />
      <Text
        className={`text-xs mt-1 ${
          isFocused ? "text-primary font-semibold" : "text-muted"
        }`}
        style={{ fontFamily: "Roboto" }}
      >
        {icons.label}
      </Text>
    </Pressable>
  );
}

function renderIOSTab(
  route: BottomTabBarProps["state"]["routes"][number],
  index: number,
  state: BottomTabBarProps["state"],
  navigation: BottomTabBarProps["navigation"],
  isAdmin: boolean
) {
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
      className={`flex-1 items-center justify-center py-3 rounded-full ${
        isFocused ? "bg-primary/10" : ""
      }`}
      style={{ transitionDuration: "0.2s" }}
    >
      <Ionicons
        name={isFocused ? icons.selected : icons.default}
        size={22}
        color={isFocused ? PRIMARY : MUTED}
      />
      <Text
        className={`text-xs mt-1 ${
          isFocused ? "text-primary font-semibold" : "text-muted"
        }`}
        style={{ fontFamily: "SF Pro Text" }}
      >
        {icons.label}
      </Text>
    </Pressable>
  );
}

export function FloatingTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useUserStore();

  const filteredRoutes = state.routes.filter((route) => route.name !== "create");

  const createRoute = state.routes.find((route) => route.name === "create");
  const createIndex = state.routes.findIndex((route) => route.name === "create");

  const leftTabs = filteredRoutes.slice(0, Math.floor(filteredRoutes.length / 2));
  const rightTabs = filteredRoutes.slice(Math.floor(filteredRoutes.length / 2));

  return (
    <View
      className="absolute left-5 right-5 flex-row items-center justify-around rounded-full border border-slate-100 bg-white px-2 py-1"
      style={{
        bottom: insets.bottom + 12,
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 14,
      }}
    >
      {leftTabs.map((route, index) => {
        const actualIndex = state.routes.indexOf(route);
        if (Platform.OS === "android") {
          return renderAndroidTab(route, actualIndex, state, navigation, isAdmin);
        } else {
          return renderIOSTab(route, actualIndex, state, navigation, isAdmin);
        }
      })}
      {createRoute && isAdmin && (() => {
        if (Platform.OS === "android") {
          return renderAndroidTab(createRoute, createIndex, state, navigation, isAdmin);
        } else {
          return renderIOSTab(createRoute, createIndex, state, navigation, isAdmin);
        }
      })()}
      {rightTabs.map((route, index) => {
        const actualIndex = state.routes.indexOf(route);
        if (Platform.OS === "android") {
          return renderAndroidTab(route, actualIndex, state, navigation, isAdmin);
        } else {
          return renderIOSTab(route, actualIndex, state, navigation, isAdmin);
        }
      })}
    </View>
  );
}
