import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@/constants";
import { RecoveryStatusType } from "@/types/database";

interface StatusBadgeProps {
  status: RecoveryStatusType;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export function StatusBadge({ status, size = "md", style }: StatusBadgeProps) {
  const getBadgeColors = () => {
    switch (status) {
      case "PUSH":
        return {
          bg: colors.pushBackground,
          border: colors.pushBorder,
          text: colors.push,
        };
      case "MODERATE":
        return {
          bg: colors.moderateBackground,
          border: colors.moderateBorder,
          text: colors.moderate,
        };
      case "RECOVER":
        return {
          bg: colors.recoverBackground,
          border: colors.recoverBorder,
          text: colors.recover,
        };
    }
  };

  const badgeColors = getBadgeColors();

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Recovery status: ${status}`}
      style={[
        styles.badge,
        styles[size],
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: badgeColors.text }]} />
      <Text style={[styles.text, styles[`${size}Text`], { color: badgeColors.text }]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radius.badge,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  lg: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  text: {
    fontWeight: typography.weights.bold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  smText: {
    fontSize: typography.sizes.xs - 1,
  },
  mdText: {
    fontSize: typography.sizes.sm - 1,
  },
  lgText: {
    fontSize: typography.sizes.base - 1,
  },
});
