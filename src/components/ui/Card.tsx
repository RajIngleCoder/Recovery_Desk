import React, { ReactNode } from "react";
import { StyleSheet, View, ViewStyle, StyleProp, Platform } from "react-native";
import { colors, radius, spacing } from "@/constants";

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated" | "muted" | "highlight";
  padding?: keyof typeof spacing;
}

export function Card({
  children,
  style,
  variant = "default",
  padding = "base",
}: CardProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case "elevated":
        return colors.surfaceElevated;
      case "muted":
        return colors.surfaceMuted;
      case "highlight":
        return colors.surface;
      case "default":
      default:
        return colors.surface;
    }
  };

  const getBorderColor = () => {
    if (variant === "highlight") return colors.primary;
    return colors.border;
  };

  const isElevated = variant === "elevated" || variant === "highlight";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "highlight" ? 1.5 : 1,
          padding: spacing[padding],
        },
        isElevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
