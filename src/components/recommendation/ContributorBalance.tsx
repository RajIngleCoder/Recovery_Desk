import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/constants";
import { RecoveryFactor } from "@/domain/recovery/types";

interface ContributorBalanceProps {
  factors: RecoveryFactor[];
}

export function ContributorBalance({ factors }: ContributorBalanceProps) {
  const helped = factors.filter((f) => f.sentiment === "positive");
  const heldBack = factors.filter((f) => f.sentiment === "negative");

  return (
    <>
      <Text style={styles.sectionHeading}>CONTRIBUTOR BALANCE</Text>
      <View style={styles.balanceRow}>
        <Card style={styles.balanceCard}>
          <Text style={[styles.balanceTitle, { color: colors.push }]}>WHAT HELPED (↑)</Text>
          {helped.length > 0 ? (
            helped.map((f) => (
              <View key={f.metric} style={styles.balanceItem}>
                <Text style={[styles.balanceCheck, { color: colors.push }]}>✓</Text>
                <View style={styles.balanceTextGroup}>
                  <Text style={styles.balanceMetricName}>{f.label}</Text>
                  <Text style={styles.balanceMetricDetail}>{f.currentValue}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.balanceEmpty}>No elevated surges today.</Text>
          )}
        </Card>

        <Card style={styles.balanceCard}>
          <Text style={[styles.balanceTitle, { color: colors.recover }]}>HELD BACK (↓)</Text>
          {heldBack.length > 0 ? (
            heldBack.map((f) => (
              <View key={f.metric} style={styles.balanceItem}>
                <Text style={[styles.balanceCheck, { color: colors.recover }]}>•</Text>
                <View style={styles.balanceTextGroup}>
                  <Text style={styles.balanceMetricName}>{f.label}</Text>
                  <Text style={styles.balanceMetricDetail}>{f.currentValue}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.balanceEmpty}>No significant strain markers.</Text>
          )}
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  balanceRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  balanceCard: {
    flex: 1,
    padding: spacing.md,
  },
  balanceTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  balanceItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: spacing.xs,
  },
  balanceCheck: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    marginTop: 1,
  },
  balanceTextGroup: {
    flex: 1,
  },
  balanceMetricName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  balanceMetricDetail: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  balanceEmpty: {
    fontSize: typography.sizes.xs,
    fontStyle: "italic",
    color: colors.textMuted,
  },
});
