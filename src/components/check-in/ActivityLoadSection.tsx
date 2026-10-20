import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { colors, spacing, typography, radius } from "@/constants";
import { ActivityLoadType } from "@/types/database";

const LOAD_OPTIONS = [
  {
    value: "low" as ActivityLoadType,
    label: "Low",
    desc: "Rest or light movement",
  },
  {
    value: "moderate" as ActivityLoadType,
    label: "Moderate",
    desc: "Zone 2 or regular session",
  },
  {
    value: "high" as ActivityLoadType,
    label: "High",
    desc: "Intervals, long or hard",
  },
];

interface ActivityLoadSectionProps {
  activityLoad: ActivityLoadType;
  error?: string;
  onSelect: (value: ActivityLoadType) => void;
}

export function ActivityLoadSection({
  activityLoad,
  error,
  onSelect,
}: ActivityLoadSectionProps) {
  return (
    <>
      <View style={[styles.sectionHeaderRow, styles.marginTopMd]}>
        <Text style={styles.sectionHeading}>YESTERDAY'S ACTIVITY LOAD</Text>
      </View>
      <Text style={styles.sectionDescription}>
        Subjective training volume and physical strain estimate.
      </Text>

      <View style={styles.loadRow}>
        {LOAD_OPTIONS.map((item) => {
          const isSelected = activityLoad === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.loadCard,
                isSelected && styles.loadCardActive,
              ]}
              onPress={() => onSelect(item.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Activity load: ${item.label} (${item.desc})`}
            >
              <Text
                style={[
                  styles.loadCardTitle,
                  isSelected && styles.loadCardTitleActive,
                ]}
              >
                {item.label}
              </Text>
              <Text
                style={[
                  styles.loadCardDesc,
                  isSelected && styles.loadCardDescActive,
                ]}
              >
                {item.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.fieldErrorText}>{error}</Text>}
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
  loadRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  loadCard: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    gap: spacing.xxs,
  },
  loadCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  loadCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  loadCardTitleActive: {
    color: colors.primary,
  },
  loadCardDesc: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: "center",
  },
  loadCardDescActive: {
    color: colors.primary,
  },
  fieldErrorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginBottom: spacing.sm,
  },
});
