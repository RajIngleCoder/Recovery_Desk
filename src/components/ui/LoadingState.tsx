import React from "react";
import { StyleSheet, View, Text, ActivityIndicator, ViewStyle } from "react-native";
import { colors, spacing, typography } from "@/constants";

interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
}

export function LoadingState({
  message = "Loading recovery data...",
  style,
}: LoadingStateProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    minHeight: 200,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
