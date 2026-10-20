import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography } from "@/constants";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function getTabIcon(routeName: string, focused: boolean): IconName {
  switch (routeName) {
    case "index":
      return focused ? "compass" : "compass-outline";
    case "history":
      return focused ? "calendar" : "calendar-outline";
    case "trends":
      return focused ? "trending-up" : "trending-up-outline";
    case "profile":
      return focused ? "person" : "person-outline";
    default:
      return "ellipse-outline";
  }
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = getTabIcon(route.name, focused);
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.medium,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: "Trends",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
