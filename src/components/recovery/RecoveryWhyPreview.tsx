import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { colors, radius, spacing, typography } from "@/constants";
import { RecoveryFactor } from "@/domain/recovery/types";

interface RecoveryWhyPreviewProps {
  factors: RecoveryFactor[];
}

export function RecoveryWhyPreview({ factors }: RecoveryWhyPreviewProps) {
  return (
    <View style={styles.whyPreviewBox}>
      <Text style={styles.whyPreviewTitle}>WHY THIS RECOMMENDATION?</Text>
      <View style={styles.whyFactorsList}>
        {factors.map((f) => {
          const isPos = f.sentiment === "positive";
          const isNeg = f.sentiment === "negative";
          const arrow = isPos ? "↑" : isNeg ? "↓" : "→";
          const arrowColor = isPos ? colors.push : isNeg ? colors.recover : colors.textSecondary;

          return (
            <View key={f.metric} style={styles.whyFactorRow}>
              <Text style={[styles.whyFactorArrow, { color: arrowColor }]}>{arrow}</Text>
              <Text style={styles.whyFactorLabel}>{f.label}:</Text>
              <Text style={styles.whyFactorValue} numberOfLines={1}>
                {f.deviation}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  whyPreviewBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  whyPreviewTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  whyFactorsList: {
    gap: 4,
  },
  whyFactorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  whyFactorArrow: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    width: 12,
  },
  whyFactorLabel: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    width: 76,
  },
  whyFactorValue: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
});
