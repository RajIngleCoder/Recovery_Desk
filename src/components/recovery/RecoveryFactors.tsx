import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors, radius, spacing, typography } from "@/constants";
import { RecoveryFactor } from "@/domain/recovery/types";
import { DailyMetricRow } from "@/types/database";

interface RecoveryFactorsProps {
  factors: RecoveryFactor[];
  recentMetrics?: DailyMetricRow[];
  style?: ViewStyle;
}

export function RecoveryFactors({ factors, recentMetrics = [], style }: RecoveryFactorsProps) {
  const getSentimentColor = (sentiment: "positive" | "neutral" | "negative") => {
    switch (sentiment) {
      case "positive":
        return colors.push;
      case "neutral":
        return colors.moderate;
      case "negative":
        return colors.recover;
    }
  };

  const getSentimentIcon = (sentiment: "positive" | "neutral" | "negative") => {
    switch (sentiment) {
      case "positive":
        return "✓";
      case "neutral":
        return "•";
      case "negative":
        return "!";
    }
  };

  // Helper to extract chronological sequence for a metric (oldest first, up to 7 items)
  const getChronologicalValues = (metricKey: "hrv" | "resting_hr" | "sleep_hours") => {
    if (!recentMetrics || recentMetrics.length === 0) return [];
    const sorted = [...recentMetrics].sort((a, b) => a.date.localeCompare(b.date));
    const slice = sorted.slice(-7);
    return slice.map((m) => Number(m[metricKey]) || 0);
  };

  // Renders a sleek 7-day sparkline bar visual (Always renders 7 slots)
  const renderMiniSparkline = (metric: RecoveryFactor["metric"], activeColor: string) => {
    if (metric === "activity_load") return null;

    let values: number[] = [];
    if (metric === "hrv") values = getChronologicalValues("hrv");
    else if (metric === "resting_hr") values = getChronologicalValues("resting_hr");
    else if (metric === "sleep") values = getChronologicalValues("sleep_hours");

    // Pad to 7 slots so the visual track is always complete
    const totalSlots = 7;
    const min = values.length > 0 ? Math.min(...values) : 50;
    const max = values.length > 0 ? Math.max(...values) : 80;
    const range = max - min || 1;

    // Fill missing past slots with null
    const emptyCount = Math.max(0, totalSlots - values.length);
    const slots: (number | null)[] = [...Array(emptyCount).fill(null), ...values];

    return (
      <View style={styles.sparklineContainer}>
        <View style={styles.sparklineHeader}>
          <Text style={styles.sparklineLabel}>7-DAY PATTERN</Text>
        </View>
        <View style={styles.barsRow}>
          {slots.map((val, idx) => {
            const isToday = idx === totalSlots - 1;
            const hasData = val !== null;
            
            // Normalize height between 6px and 22px
            const heightPct = hasData ? (val - min) / range : 0;
            const barHeight = hasData ? Math.max(6, Math.round(6 + heightPct * 16)) : 3;

            return (
              <View key={idx} style={styles.barColumn}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: barHeight,
                      backgroundColor: isToday && hasData ? activeColor : hasData ? colors.borderActive : colors.border,
                      opacity: isToday ? 1 : hasData ? 0.7 : 0.35,
                      borderRadius: hasData ? 2 : 1,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionHeading}>KEY SIGNALS & YOUR BASELINE</Text>

      <View style={styles.grid}>
        {factors.map((factor) => {
          const color = getSentimentColor(factor.sentiment);
          const icon = getSentimentIcon(factor.sentiment);

          return (
            <Card key={factor.metric} style={styles.factorCard}>
              <View style={styles.factorHeader}>
                <Text style={styles.factorLabel}>{factor.label.toUpperCase()}</Text>
                <View
                  style={[
                    styles.sentimentBadge,
                    { backgroundColor: `${color}1A`, borderColor: `${color}4D` },
                  ]}
                >
                  <Text style={[styles.sentimentText, { color }]}>{icon}</Text>
                </View>
              </View>

              <Text style={styles.currentValue}>{factor.currentValue}</Text>

              <Text style={[styles.deviationText, { color }]}>
                {factor.deviation}
              </Text>

              {factor.baselineValue && (
                <Text style={styles.baselineText}>
                  Your 14d baseline: <Text style={styles.boldBaseline}>{factor.baselineValue}</Text>
                </Text>
              )}

              {/* Mini 7-day pattern sparkline */}
              {renderMiniSparkline(factor.metric, color)}
            </Card>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  sectionHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  factorCard: {
    width: "48%",
    flexGrow: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  factorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxs,
  },
  factorLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  sentimentBadge: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  currentValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
    marginBottom: 2,
  },
  deviationText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xxs,
  },
  baselineText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  boldBaseline: {
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  sparklineContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sparklineHeader: {
    marginBottom: 4,
  },
  sparklineLabel: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 22,
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  barFill: {
    width: "100%",
    borderRadius: 2,
  },
});
