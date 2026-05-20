import type { PropsWithChildren } from "react";
import type { Edge } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  edges?: Edge[];
  className?: string;
  /** Extra bottom space when using the floating tab bar */
  withTabBarPadding?: boolean;
}>;

export function Screen({
  children,
  edges = ["top", "left", "right"],
  className = "flex-1",
  withTabBarPadding = false,
}: ScreenProps) {
  return (
    <SafeAreaView
      className={`${className}${withTabBarPadding ? " pb-28" : ""}`}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}
