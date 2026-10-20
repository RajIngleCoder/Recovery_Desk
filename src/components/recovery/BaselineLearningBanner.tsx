import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors, radius, spacing, typography } from "@/constants";

interface BaselineLearningBannerProps {
  dataCount: number;
  minRequired?: number;
  style?: ViewStyle;
}

export function BaselineLearningBanner({
  dataCount,
  minRequired = 3,
  style,
}: BaselineLearningBannerProps) {
  const progressPercent = Math.min(100, Math.round((dataCount / minRequired) * 100));

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.indicatorDot} />
        <Text style={styles.badgeText}>BASELINE LEARNING</Text>
        <Text style={styles.progressText}>
          {dataCount} of {minRequired} days logged
        </Text>
      </View>

      <Text style={styles.title}>We're still learning your normal range</Text>
      <Text style={styles.description}>
        Add a few more days of recovery data to establish your personalized baseline.
        In the meantime, today's guidance is based on safe baseline estimates.
      </Text>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderActive,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginRight: spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginLeft: "auto",
    fontWeight: typography.weights.medium,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
    marginBottom: spacing.sm,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
