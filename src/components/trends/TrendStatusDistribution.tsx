import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Card } from "@/components/ui";
import { colors, spacing, typography, radius } from "@/constants";
import { StatusDistribution } from "@/domain/recovery/trends";

interface TrendStatusDistributionProps {
  distribution: StatusDistribution;
}

export function TrendStatusDistribution({ distribution }: TrendStatusDistributionProps) {
  const { push, moderate, recover, total } = distribution;

  if (total === 0) {
    return null;
  }

  const pushPct = Math.round((push / total) * 100);
  const moderatePct = Math.round((moderate / total) * 100);
  const recoverPct = Math.round((recover / total) * 100);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Recovery Decisions</Text>
        <Text style={styles.subtitle}>{total} recovery {total === 1 ? "decision" : "decisions"} in the last 7 days</Text>
      </View>

      {/* Segmented Distribution Bar */}
      <View style={styles.barTrack}>
        {push > 0 && (
          <View style={[styles.barSegment, { flex: push, backgroundColor: colors.push }]} />
        )}
        {moderate > 0 && (
          <View
            style={[styles.barSegment, { flex: moderate, backgroundColor: colors.moderate }]}
          />
        )}
        {recover > 0 && (
          <View style={[styles.barSegment, { flex: recover, backgroundColor: colors.recover }]} />
        )}
      </View>

      {/* Breakdown Pills */}
      <View style={styles.pillsRow}>
        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: colors.push }]} />
          <Text style={styles.pillLabel}>PUSH</Text>
          <Text style={styles.pillValue}>
            {push} <Text style={styles.pillPct}>({pushPct}%)</Text>
          </Text>
        </View>

        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: colors.moderate }]} />
          <Text style={styles.pillLabel}>MODERATE</Text>
          <Text style={styles.pillValue}>
            {moderate} <Text style={styles.pillPct}>({moderatePct}%)</Text>
          </Text>
        </View>

        <View style={styles.pill}>
          <View style={[styles.dot, { backgroundColor: colors.recover }]} />
          <Text style={styles.pillLabel}>RECOVER</Text>
          <Text style={styles.pillValue}>
            {recover} <Text style={styles.pillPct}>({recoverPct}%)</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  barTrack: {
    flexDirection: "row",
    height: 10,
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.md,
  },
  barSegment: {
    height: "100%",
  },
  pillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    padding: spacing.xs,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  pillValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  pillPct: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
});
