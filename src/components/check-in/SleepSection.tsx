import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { AppTextInput } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { DailyMetricsValidationErrors } from "@/lib/validation";

interface SleepSectionProps {
  sleepHours: string;
  sleepMinutes: string;
  sleepScore: string;
  calculatedSleep: string | null;
  fieldErrors: DailyMetricsValidationErrors;
  onChangeSleepHours: (text: string) => void;
  onChangeSleepMinutes: (text: string) => void;
  onChangeSleepScore: (text: string) => void;
}

export function SleepSection({
  sleepHours,
  sleepMinutes,
  sleepScore,
  calculatedSleep,
  fieldErrors,
  onChangeSleepHours,
  onChangeSleepMinutes,
  onChangeSleepScore,
}: SleepSectionProps) {
  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>SLEEP DURATION</Text>
      </View>
      <Text style={styles.sectionDescription}>
        Total time in bed including naps.
      </Text>

      <View style={styles.sleepRow}>
        <View style={styles.sleepFieldContainer}>
          <AppTextInput
            label="Hours"
            placeholder="8"
            keyboardType="number-pad"
            maxLength={2}
            value={sleepHours}
            onChangeText={onChangeSleepHours}
            error={fieldErrors.sleep}
            unit="hr"
          />
        </View>
        <View style={styles.sleepFieldContainer}>
          <AppTextInput
            label="Minutes"
            placeholder="30"
            keyboardType="number-pad"
            maxLength={2}
            value={sleepMinutes}
            onChangeText={onChangeSleepMinutes}
            error={fieldErrors.sleep}
            unit="min"
          />
        </View>
      </View>

      {calculatedSleep && (
        <Text style={styles.sleepCalculated}>Total Sleep: {calculatedSleep}</Text>
      )}

      {/* Sleep Score (optional) */}
      <AppTextInput
        label="Sleep Score (optional)"
        placeholder="e.g. 82"
        keyboardType="number-pad"
        maxLength={3}
        value={sleepScore}
        onChangeText={onChangeSleepScore}
        error={fieldErrors.sleepScore}
        unit="pts"
        hint="Provided by your wearable or sleep tracker (0-100)"
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  sectionHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  sectionDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sleepRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  sleepFieldContainer: {
    flex: 1,
  },
  sleepCalculated: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
});
