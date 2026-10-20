import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Card } from "@/components/ui";
import { colors, spacing, typography, radius } from "@/constants";
import { MetricTrendSummary, TrendDirection } from "@/domain/recovery/trends";
import { LightweightBarChart } from "./LightweightBarChart";

interface TrendMetricCardProps {
  summary: MetricTrendSummary;
  icon: string;
  accentColor: string;
}

function getTrendBadge(direction: TrendDirection, metric: "hrv" | "resting_hr" | "sleep") {
  switch (direction) {
    case "improving":
      return {
        label: "Improving ↗",
        bg: colors.pushBackground,
        color: colors.push,
        border: colors.pushBorder,
      };
    case "declining":
      return {
        label: "Declining ↘",
        bg: colors.recoverBackground,
        color: colors.recover,
        border: colors.recoverBorder,
      };
    case "stable":
      return {
        label: "Stable →",
        bg: colors.surfaceMuted,
        color: colors.textSecondary,
        border: colors.border,
      };
    case "insufficient_data":
    default:
      return {
        label: "Learning",
        bg: colors.moderateBackground,
        color: colors.moderate,
        border: colors.moderateBorder,
      };
  }
}

export function TrendMetricCard({ summary, icon, accentColor }: TrendMetricCardProps) {
  const badge = getTrendBadge(summary.trendDirection, summary.metric);
  const isLearning = summary.baselineStatus === "learning";

  return (
    <Card style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{summary.label}</Text>
        </View>
        <View
          style={[
            styles.trendBadge,
            { backgroundColor: badge.bg, borderColor: badge.border },
          ]}
        >
          <Text style={[styles.trendBadgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Stats Summary Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>7-DAY AVERAGE</Text>
          <Text style={[styles.statValue, { color: accentColor }]}>
            {summary.formattedAverage}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>14-DAY BASELINE</Text>
          <Text style={styles.statValue}>
            {isLearning ? "Learning..." : summary.formattedBaseline}
          </Text>
        </View>
      </View>

      {/* Chart */}
      {summary.points.length > 0 ? (
        <LightweightBarChart
          points={summary.points}
          baseline={summary.baseline}
          minValue={summary.minValue}
          maxValue={summary.maxValue}
          unit={summary.unit}
          accentColor={accentColor}
          metricLabel={summary.label}
        />
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>No metric entries recorded yet.</Text>
        </View>
      )}

      {/* Explanatory Footer */}
      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          {isLearning
            ? "Baseline will establish after 3 days of recorded check-ins."
            : summary.baseline !== null && summary.average !== null
            ? summary.metric === "resting_hr"
              ? summary.average <= summary.baseline
                ? "Resting heart rate is at or below baseline, indicating positive rest and recovery."
                : "Resting pulse is slightly elevated above rolling baseline."
              : summary.average >= summary.baseline
              ? `${summary.label} is pacing at or above your 14-day baseline.`
              : `${summary.label} is currently below your 14-day baseline.`
            : "Comparing your 7-day readings with rolling baseline trends."}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  trendBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  trendBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  emptyChart: {
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
  },
  emptyChartText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  footerNote: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
