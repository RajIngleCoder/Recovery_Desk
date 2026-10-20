import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { AppTextInput } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { DailyMetricsValidationErrors } from "@/lib/validation";

interface BiomarkersSectionProps {
  hrv: string;
  restingHr: string;
  fieldErrors: DailyMetricsValidationErrors;
  onChangeHrv: (text: string) => void;
  onChangeRestingHr: (text: string) => void;
}

export function BiomarkersSection({
  hrv,
  restingHr,
  fieldErrors,
  onChangeHrv,
  onChangeRestingHr,
}: BiomarkersSectionProps) {
  return (
    <>
      <View style={[styles.sectionHeaderRow, styles.marginTopMd]}>
        <Text style={styles.sectionHeading}>RECOVERY BIOMARKERS</Text>
      </View>
      <Text style={styles.sectionDescription}>
        Morning resting readings taken shortly after waking.
      </Text>

      <AppTextInput
        label="Heart Rate Variability (HRV)"
        placeholder="e.g. 58"
        keyboardType="number-pad"
        maxLength={3}
        value={hrv}
        onChangeText={onChangeHrv}
        error={fieldErrors.hrv}
        unit="ms"
        hint="Supported range: 10–250 ms (typical: 45–110 ms)"
      />

      <AppTextInput
        label="Resting Heart Rate"
        placeholder="e.g. 48"
        keyboardType="number-pad"
        maxLength={3}
        value={restingHr}
        onChangeText={onChangeRestingHr}
        error={fieldErrors.restingHr}
        unit="bpm"
        hint="Supported range: 35–130 bpm (typical: 45–65 bpm)"
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
  marginTopMd: {
    marginTop: spacing.md,
  },
});
