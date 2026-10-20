import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Card, StatusBadge, AppButton } from "@/components/ui";
import { colors, spacing, typography, radius } from "@/constants";
import { formatDisplayDate, formatSleepDuration } from "@/lib/date";
import { DailyMetricRow, RecommendationRow } from "@/types/database";

interface HistoryEntryCardProps {
  metric: DailyMetricRow;
  recommendation: RecommendationRow | null;
  isToday: boolean;
  isExpanded: boolean;
  isDeleting: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
}

export function HistoryEntryCard({
  metric,
  recommendation,
  isToday,
  isExpanded,
  isDeleting,
  onToggleExpand,
  onDelete,
}: HistoryEntryCardProps) {
  const router = useRouter();
  const hasRec = recommendation !== null;
  const reasonData = recommendation?.reason_data as {
    title?: string;
    body?: string;
    reason?: string;
  } | null;

  return (
    <Card style={styles.entryCard}>
      {/* Top Bar: Date & Status Badge */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggleExpand}
        style={styles.cardHeader}
        accessibilityRole="button"
        accessibilityLabel={`Toggle details for ${formatDisplayDate(metric.date)}`}
      >
        <View style={styles.dateGroup}>
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {formatDisplayDate(metric.date)}
            </Text>
            {isToday && (
              <View style={styles.todayPill}>
                <Text style={styles.todayPillText}>TODAY</Text>
              </View>
            )}
          </View>
          <Text style={styles.expandHint}>
            {isExpanded ? "Tap to collapse ▲" : "Tap for details ▼"}
          </Text>
        </View>

        {hasRec ? (
          <StatusBadge status={recommendation.status} size="sm" />
        ) : (
          <View style={styles.loggedBadge}>
            <Text style={styles.loggedBadgeText}>LOGGED</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>HRV</Text>
          <Text style={styles.metricValue}>{Math.round(metric.hrv)} ms</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>RESTING HR</Text>
          <Text style={styles.metricValue}>{Math.round(metric.resting_hr)} bpm</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>SLEEP</Text>
          <Text style={styles.metricValue}>
            {formatSleepDuration(metric.sleep_hours)}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>LOAD</Text>
          <Text
            style={[
              styles.metricValue,
              {
                color:
                  metric.activity_load === "low"
                    ? colors.push
                    : metric.activity_load === "high"
                    ? colors.recover
                    : colors.moderate,
              },
            ]}
          >
            {metric.activity_load.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Expanded Details Section */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          {/* Decision Rationale */}
          {reasonData && (
            <View style={styles.rationaleBox}>
              <Text style={styles.rationaleTitle}>{reasonData.title}</Text>
              {reasonData.reason && (
                <Text style={styles.rationaleReason}>"{reasonData.reason}"</Text>
              )}
            </View>
          )}

          {/* Sleep Score (if provided) */}
          {metric.sleep_score !== null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sleep Quality Score:</Text>
              <Text style={styles.detailValue}>{metric.sleep_score} / 100</Text>
            </View>
          )}

          {/* Notes (if provided) */}
          {metric.notes && metric.notes.trim().length > 0 && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{metric.notes}</Text>
            </View>
          )}

          {/* Action Buttons: Edit & Delete */}
          <View style={styles.actionsRow}>
            <AppButton
              title="Edit Entry"
              variant="secondary"
              style={styles.actionBtn}
              onPress={() =>
                router.push({
                  pathname: "/(app)/check-in",
                  params: { date: metric.date },
                })
              }
            />

            <AppButton
              title={isDeleting ? "Deleting..." : "Delete"}
              variant="danger"
              style={styles.actionBtn}
              loading={isDeleting}
              onPress={onDelete}
            />
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  entryCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  dateGroup: {
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dateText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  todayPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  todayPillText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  expandHint: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  loggedBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loggedBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  metricsGrid: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.sm,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  expandedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rationaleBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  rationaleTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  rationaleReason: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xxs,
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  notesBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  notesLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    marginBottom: 2,
  },
  notesText: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    minWidth: 100,
  },
});
