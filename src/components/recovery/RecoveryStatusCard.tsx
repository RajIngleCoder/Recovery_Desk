import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { colors, spacing, typography } from "@/constants";
import { RecoveryDecision } from "@/domain/recovery/types";
import { RecoveryHeroScore } from "./RecoveryHeroScore";
import { RecoveryTodayPlan } from "./RecoveryTodayPlan";
import { RecoveryWhyPreview } from "./RecoveryWhyPreview";

export interface RecoveryStatusCardProps {
  decision: RecoveryDecision;
  onWhyPress: () => void;
  onEditPress: () => void;
  style?: ViewStyle;
}

export function RecoveryStatusCard({
  decision,
  onWhyPress,
  onEditPress,
  style,
}: RecoveryStatusCardProps) {
  const getStatusColor = () => {
    switch (decision.status) {
      case "PUSH":
        return colors.push;
      case "MODERATE":
        return colors.moderate;
      case "RECOVER":
        return colors.recover;
    }
  };

  const getStatusBgColor = () => {
    switch (decision.status) {
      case "PUSH":
        return colors.pushBackground || "rgba(43, 138, 62, 0.08)";
      case "MODERATE":
        return colors.moderateBackground || "rgba(230, 119, 0, 0.08)";
      case "RECOVER":
        return colors.recoverBackground || "rgba(201, 42, 42, 0.08)";
    }
  };

  const formatTime = (isoString?: string): string => {
    if (!isoString) return "Just now";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "Just now";
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  const plan = decision.plan;
  const statusColor = getStatusColor();
  const statusBgColor = getStatusBgColor();

  const readinessTierText =
    decision.readinessTier ||
    (decision.status === "PUSH"
      ? "Prime Readiness (85–100)"
      : decision.status === "MODERATE"
      ? "Moderate Readiness (60–84)"
      : "Recovery Priority (0–59)");

  // Count valid signals (out of 4)
  const availableSignals = decision.factors.filter(
    (f) => f.currentValue && f.currentValue !== "0 ms" && f.currentValue !== "0 bpm" && f.currentValue !== "0h"
  ).length;

  return (
    <Card style={[styles.card, style]}>
      {/* Category Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>TODAY'S RECOVERY</Text>
        <Text style={styles.timestampText}>Updated {formatTime(decision.calculatedAt)}</Text>
      </View>

      {/* Hero Score Showcase */}
      <RecoveryHeroScore
        score={decision.score}
        status={decision.status}
        readinessTierText={readinessTierText}
        statusColor={statusColor}
        statusBgColor={statusBgColor}
      />

      {/* Level 1: Interpretation Headline */}
      {plan?.headline ? (
        <Text style={styles.headline}>{plan.headline}</Text>
      ) : (
        <Text style={styles.body}>{decision.body}</Text>
      )}

      {/* Level 1: Structured Today's Plan */}
      <RecoveryTodayPlan plan={plan} fallbackAction={decision.action} />

      {/* Level 2: Why Preview (Quick Drivers Summary) */}
      <RecoveryWhyPreview factors={decision.factors} />

      {/* Factual Underlying Reason */}
      <Text style={styles.reasonText}>“{decision.reason}”</Text>

      {/* Data Quality & Completeness Trust Indicator */}
      <View style={styles.dataQualityRow}>
        <View style={styles.qualityDot} />
        <Text style={styles.qualityText}>
          {availableSignals}/4 recovery signals logged • High confidence
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <AppButton
          title="Explain My Recovery →"
          onPress={onWhyPress}
          variant="secondary"
          style={styles.whyButton}
        />
        <AppButton
          title="Edit data"
          onPress={onEditPress}
          variant="outline"
          style={styles.editButton}
        />
      </View>
      <View style={styles.explainTrustRow}>
        <Ionicons name="analytics-outline" size={12} color={colors.primary} />
        <Text style={styles.explainTrustText}>
          Transparent 4-signal breakdown & baseline comparison
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  timestampText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  headline: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  reasonText: {
    fontSize: typography.sizes.xs,
    fontStyle: "italic",
    color: colors.textSecondary,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  dataQualityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  qualityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.push,
  },
  qualityText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  whyButton: {
    flex: 2,
    minHeight: 44,
  },
  editButton: {
    flex: 1,
    minHeight: 44,
  },
  explainTrustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: spacing.xs,
  },
  explainTrustText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
});
