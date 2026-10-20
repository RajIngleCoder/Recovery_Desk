import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { colors, radius, spacing, typography } from "@/constants";
import { TodayPlan } from "@/domain/recovery/types";

interface RecoveryTodayPlanProps {
  plan?: TodayPlan;
  fallbackAction?: string;
}

export function RecoveryTodayPlan({ plan, fallbackAction }: RecoveryTodayPlanProps) {
  if (!plan) {
    return (
      <View style={styles.suggestionBox}>
        <Text style={styles.suggestionLabel}>TODAY'S ACTION</Text>
        <Text style={styles.suggestionText}>{fallbackAction}</Text>
      </View>
    );
  }

  return (
    <View style={styles.planBox}>
      <View style={styles.planHeader}>
        <Text style={styles.planLabel}>TODAY'S PLAN</Text>
      </View>

      <View style={styles.pillarRow}>
        <Text style={styles.pillarEmoji}>🏃</Text>
        <View style={styles.pillarContent}>
          <Text style={styles.pillarLabel}>TRAINING</Text>
          <Text style={styles.pillarValue}>{plan.training}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.pillarRow}>
        <Text style={styles.pillarEmoji}>🚶</Text>
        <View style={styles.pillarContent}>
          <Text style={styles.pillarLabel}>MOVEMENT</Text>
          <Text style={styles.pillarValue}>{plan.movement}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.pillarRow}>
        <Text style={styles.pillarEmoji}>😴</Text>
        <View style={styles.pillarContent}>
          <Text style={styles.pillarLabel}>RECOVERY</Text>
          <Text style={styles.pillarValue}>{plan.recovery}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  planBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planHeader: {
    marginBottom: spacing.sm,
  },
  planLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  pillarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  pillarEmoji: {
    fontSize: 16,
    width: 28,
  },
  pillarContent: {
    flex: 1,
  },
  pillarLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  pillarValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 2,
  },
  suggestionBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.card,
    padding: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
  },
  suggestionLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: spacing.xxs,
  },
  suggestionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
});
