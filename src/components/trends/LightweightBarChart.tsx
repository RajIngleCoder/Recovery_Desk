import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { colors, spacing, typography, radius } from "@/constants";
import { TrendDataPoint } from "@/domain/recovery/trends";

interface LightweightBarChartProps {
  points: TrendDataPoint[];
  baseline?: number | null;
  minValue: number;
  maxValue: number;
  unit: string;
  accentColor?: string;
  metricLabel: string;
}

export function LightweightBarChart({
  points,
  baseline,
  minValue,
  maxValue,
  unit,
  accentColor = colors.primary,
  metricLabel,
}: LightweightBarChartProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    points.length > 0 ? points[points.length - 1].date : null
  );

  const chartHeight = 120;
  const range = Math.max(1, maxValue - minValue);

  // Baseline position percentage from bottom
  const baselinePct =
    baseline !== undefined && baseline !== null && baseline >= minValue && baseline <= maxValue
      ? Math.min(100, Math.max(0, ((baseline - minValue) / range) * 100))
      : null;

  const selectedPoint = points.find((p) => p.date === selectedDate) || points[points.length - 1];

  return (
    <View style={styles.container}>
      {/* Selected day inspection banner */}
      {selectedPoint && selectedPoint.value !== null && (
        <View style={styles.inspectorBanner}>
          <Text style={styles.inspectorDate}>
            {selectedPoint.dayLabel}, {selectedPoint.date}:
          </Text>
          <Text style={[styles.inspectorValue, { color: accentColor }]}>
            {selectedPoint.formattedValue}
          </Text>
          {baseline !== undefined && baseline !== null && (
            <Text style={styles.inspectorBaselineDiff}>
              {selectedPoint.value >= baseline ? "+" : ""}
              {Math.round((selectedPoint.value - baseline) * 10) / 10} {unit} vs baseline
            </Text>
          )}
        </View>
      )}

      {/* Chart Canvas */}
      <View style={[styles.chartArea, { height: chartHeight }]}>
        {/* Baseline reference line */}
        {baselinePct !== null && baseline != null && (
          <View style={[styles.baselineLine, { bottom: `${baselinePct}%` }]}>
            <View style={styles.baselineDashes} />
            <View style={styles.baselinePill}>
              <Text style={styles.baselinePillText}>
                Baseline: {Math.round(baseline * 10) / 10} {unit}
              </Text>
            </View>
          </View>
        )}

        {/* Bars row */}
        <View style={styles.barsContainer}>
          {points.map((point) => {
            const isSelected = point.date === selectedDate;
            const hasValue = point.value !== null && !isNaN(point.value);
            const heightPct = hasValue
              ? Math.min(100, Math.max(8, ((point.value! - minValue) / range) * 100))
              : 4;

            return (
              <TouchableOpacity
                key={point.date}
                activeOpacity={0.8}
                onPress={() => setSelectedDate(point.date)}
                style={styles.barColumn}
                accessibilityRole="button"
                accessibilityLabel={`${point.dayLabel}: ${point.formattedValue}`}
              >
                <View style={styles.barTrack}>
                  {hasValue ? (
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPct}%`,
                          backgroundColor: isSelected ? accentColor : "#CBD5E1",
                          borderColor: isSelected ? colors.textPrimary : "transparent",
                          borderWidth: isSelected ? 1.5 : 0,
                        },
                      ]}
                    />
                  ) : (
                    <View style={styles.emptyBarDash} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisRow}>
        {points.map((point) => {
          const isSelected = point.date === selectedDate;
          return (
            <TouchableOpacity
              key={`label-${point.date}`}
              onPress={() => setSelectedDate(point.date)}
              style={styles.xLabelCol}
            >
              <Text
                style={[
                  styles.xDayLabel,
                  isSelected && { color: colors.textPrimary, fontWeight: typography.weights.bold },
                ]}
              >
                {point.dayLabel}
              </Text>
              <Text
                style={[
                  styles.xDateLabel,
                  isSelected && { color: colors.primary, fontWeight: typography.weights.medium },
                ]}
              >
                {point.shortDate}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  inspectorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inspectorDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  inspectorValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  inspectorBaselineDiff: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginLeft: "auto",
  },
  chartArea: {
    position: "relative",
    justifyContent: "flex-end",
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxs,
    paddingHorizontal: spacing.xs,
    overflow: "hidden",
  },
  baselineLine: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  baselineDashes: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: "dashed",
  },
  baselinePill: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  baselinePillText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
    zIndex: 2,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 2,
  },
  barTrack: {
    width: "70%",
    maxWidth: 24,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: radius.xs,
    borderTopRightRadius: radius.xs,
  },
  emptyBarDash: {
    width: 6,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xxs,
  },
  xAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  xLabelCol: {
    flex: 1,
    alignItems: "center",
  },
  xDayLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  xDateLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
});
