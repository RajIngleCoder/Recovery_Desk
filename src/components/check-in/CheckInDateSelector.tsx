import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants";
import { formatDisplayDate } from "@/lib/date";

export interface CheckInDateSelectorProps {
  selectedDate: string;
  todayDate: string;
  yesterdayDateStr: string;
  isCustomDate: boolean;
  existingEntryId: string | null;
  onSelectDate: (dateStr: string) => void;
  onOpenPicker: () => void;
}

export function CheckInDateSelector({
  selectedDate,
  todayDate,
  yesterdayDateStr,
  isCustomDate,
  existingEntryId,
  onSelectDate,
  onOpenPicker,
}: CheckInDateSelectorProps) {
  return (
    <Card style={styles.dateCard}>
      <View style={styles.dateHeaderRow}>
        <View>
          <Text style={styles.dateLabel}>CHECK-IN DATE</Text>
          <Text style={styles.dateValue}>
            {formatDisplayDate(selectedDate)}
          </Text>
        </View>
        {existingEntryId && (
          <View style={styles.existingBadge}>
            <Text style={styles.existingBadgeText}>EDITING</Text>
          </View>
        )}
      </View>

      {/* Quick date switch buttons */}
      <View style={styles.quickDateRow}>
        <TouchableOpacity
          style={[
            styles.quickDateBtn,
            selectedDate === todayDate && styles.quickDateBtnActive,
          ]}
          onPress={() => onSelectDate(todayDate)}
        >
          <Text
            style={[
              styles.quickDateText,
              selectedDate === todayDate && styles.quickDateTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickDateBtn,
            selectedDate === yesterdayDateStr && styles.quickDateBtnActive,
          ]}
          onPress={() => onSelectDate(yesterdayDateStr)}
        >
          <Text
            style={[
              styles.quickDateText,
              selectedDate === yesterdayDateStr && styles.quickDateTextActive,
            ]}
          >
            Yesterday
          </Text>
        </TouchableOpacity>

        {/* Pick Past Date */}
        <TouchableOpacity
          style={[
            styles.quickDateBtn,
            isCustomDate && styles.quickDateBtnActive,
          ]}
          onPress={onOpenPicker}
        >
          <Text
            style={[
              styles.quickDateText,
              isCustomDate && styles.quickDateTextActive,
            ]}
          >
            {isCustomDate
              ? formatDisplayDate(selectedDate, {
                  includeWeekday: false,
                  includeYear: false,
                })
              : "Pick date..."}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  dateCard: {
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  dateHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  dateLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  dateValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
  },
  existingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  existingBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  quickDateRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickDateBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  quickDateBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickDateText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  quickDateTextActive: {
    color: colors.surface,
  },
});
