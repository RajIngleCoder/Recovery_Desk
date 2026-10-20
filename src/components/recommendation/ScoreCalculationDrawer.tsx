import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/constants";
import { RecoveryDecision } from "@/domain/recovery/types";

interface ScoreCalculationDrawerProps {
  decision: RecoveryDecision;
}

export function ScoreCalculationDrawer({ decision }: ScoreCalculationDrawerProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <Text style={styles.sectionHeading}>HOW YOUR SCORE IS CALCULATED</Text>
      <Card variant="muted" style={styles.weightsCard}>
        <Text style={styles.weightsTitle}>Personal Baseline Formulation</Text>
        <Text style={styles.weightsBody}>
          Your recovery score combines four personal recovery signals: HRV, resting heart rate, sleep duration, and yesterday's activity load.
        </Text>

        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>
            {showDetails ? "Hide calculation details" : "View calculation details"}
          </Text>
          <Ionicons
            name={showDetails ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.primary}
          />
        </TouchableOpacity>

        {showDetails && (
          <View style={styles.weightsList}>
            <View style={styles.weightItem}>
              <Text style={styles.weightPoints}>
                {decision.pointsBreakdown?.hrv ?? Math.round(decision.score * 0.4)} / 40 pts
              </Text>
              <Text style={styles.weightLabel}>Heart Rate Variability (Daily readiness & adaptability)</Text>
            </View>
            <View style={styles.weightItem}>
              <Text style={styles.weightPoints}>
                {decision.pointsBreakdown?.restingHr ?? Math.round(decision.score * 0.3)} / 30 pts
              </Text>
              <Text style={styles.weightLabel}>Resting Heart Rate (Resting pulse & physical recharge)</Text>
            </View>
            <View style={styles.weightItem}>
              <Text style={styles.weightPoints}>
                {decision.pointsBreakdown?.sleep ?? Math.round(decision.score * 0.2)} / 20 pts
              </Text>
              <Text style={styles.weightLabel}>Sleep Duration (Sleep & energy restoration)</Text>
            </View>
            <View style={styles.weightItem}>
              <Text style={styles.weightPoints}>
                {decision.pointsBreakdown?.activityLoad ?? Math.round(decision.score * 0.1)} / 10 pts
              </Text>
              <Text style={styles.weightLabel}>Activity Load (Prior strain demand)</Text>
            </View>
            <View style={styles.totalPointsRow}>
              <Text style={styles.totalPointsLabel}>TOTAL RECOVERY SCORE</Text>
              <Text style={styles.totalPointsValue}>{Math.round(decision.score)} / 100</Text>
            </View>
            <Text style={styles.weightsDisclaimer}>
              These points reflect Recovery Desk's non-diagnostic scoring model and do not constitute clinical advice.
            </Text>
          </View>
        )}
      </Card>
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
  weightsCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  weightsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  weightsBody: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
  },
  toggleText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  weightsList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  weightItem: {
    gap: 2,
  },
  weightPoints: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  weightLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  totalPointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalPointsLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  totalPointsValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  weightsDisclaimer: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: "italic",
    lineHeight: 14,
  },
});
