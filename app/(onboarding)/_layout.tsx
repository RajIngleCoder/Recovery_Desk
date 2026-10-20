import React from "react";
import { Stack } from "expo-router";
import { colors } from "@/constants";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="sleep-target" />
    </Stack>
  );
}
