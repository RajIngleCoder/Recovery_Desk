import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/constants";
import { RecoveryFactor } from "@/domain/recovery/types";

interface FactorDetailCardProps {
  factor: RecoveryFactor;
}

export function FactorDetailCard({ factor }: FactorDetailCardProps) {
  const isPositive = factor.sentiment === "positive";
  const isNegative = factor.sentiment === "negative";

  const badgeColor = isPositive
    ? colors.push
    : isNegative
    ? colors.recover
    : colors.textSecondary;

  const badgeBg = isPositive
    ? "rgba(43, 138, 62, 0.08)"
    : isNegative
    ? "rgba(201, 42, 42, 0.08)"
    : colors.surfaceElevated;

  const impactText =
    factor.impactLabel ||
    (isPositive ? "↑ Helped" : isNegative ? "↓ Held back" : "→ At baseline");

  return (
    <Card style={styles.factorDetailCard}>
      <View style={styles.factorTitleRow}>
        <Text style={styles.factorName}>{factor.label}</Text>
        <View style={[styles.impactPill, { backgroundColor: badgeBg, borderColor: badgeColor }]}>
          <Text style={[styles.impactText, { color: badgeColor }]}>
            {impactText}
          </Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.currentValueText}>
          Reading: <Text style={styles.bold}>{factor.currentValue}</Text>
        </Text>
        {factor.baselineValue && (
          <Text style={styles.baselineValueText}>
            Your 14d Baseline: <Text style={styles.bold}>{factor.baselineValue}</Text>
          </Text>
        )}
      </View>

      <Text style={styles.deviationText}>
        Status: <Text style={[styles.bold, { color: badgeColor }]}>{factor.deviation}</Text>
      </Text>

      <Text style={styles.factorDescription}>{factor.description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  factorDetailCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  factorTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  factorName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  impactPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
  },
  impactText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.3,
  },
  valueRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.base,
    marginBottom: spacing.xs,
  },
  currentValueText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  baselineValueText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  deviationText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  bold: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  factorDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
