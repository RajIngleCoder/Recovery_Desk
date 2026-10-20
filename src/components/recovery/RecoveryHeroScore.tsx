import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { colors, radius, spacing, typography } from "@/constants";
import { RecoveryStatusType } from "@/types/database";

interface RecoveryHeroScoreProps {
  score: number;
  status: RecoveryStatusType;
  readinessTierText: string;
  statusColor: string;
  statusBgColor: string;
}

export function RecoveryHeroScore({
  score,
  status,
  readinessTierText,
  statusColor,
  statusBgColor,
}: RecoveryHeroScoreProps) {
  return (
    <View style={styles.heroSection}>
      <View style={[styles.heroScoreContainer, { borderColor: statusColor, backgroundColor: statusBgColor }]}>
        <Text style={[styles.heroScoreNumber, { color: statusColor }]}>
          {Math.round(score)}
        </Text>
        <Text style={styles.heroScoreDenom}>/100</Text>
      </View>

      <View style={styles.heroMetaContainer}>
        <StatusBadge status={status} size="lg" />
        <Text style={styles.readinessTierLabel}>{readinessTierText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    marginBottom: spacing.md,
  },
  heroScoreContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    minWidth: 100,
  },
  heroScoreNumber: {
    fontSize: 34,
    fontWeight: typography.weights.bold,
    letterSpacing: -1,
  },
  heroScoreDenom: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  heroMetaContainer: {
    flex: 1,
    gap: spacing.xxs,
  },
  readinessTierLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});
