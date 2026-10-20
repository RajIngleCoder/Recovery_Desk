import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "@/constants";
import { AppButton } from "./AppButton";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorIcon}>
        <Text style={styles.exclamationMark}>!</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <AppButton
          title={retryLabel}
          onPress={onRetry}
          variant="secondary"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginVertical: spacing.lg,
  },
  errorIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  exclamationMark: {
    color: colors.error,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.md,
    minWidth: 140,
  },
});
