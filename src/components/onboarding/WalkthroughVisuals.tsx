import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { colors, radius, spacing, typography } from "@/constants";

// Visual 1: Interactive Decision Switcher
export function DecisionSwitcherVisual() {
  const [activeDecision, setActiveDecision] = useState<"push" | "moderate" | "recover">("push");

  const decisionData = {
    push: {
      score: "92",
      badge: "PUSH",
      color: colors.push,
      bg: colors.pushBackground,
      border: colors.pushBorder,
      headline: "High Readiness",
      guidance: "Attack high intensity intervals or heavy strength sessions today.",
    },
    moderate: {
      score: "78",
      badge: "MODERATE",
      color: colors.moderate,
      bg: colors.moderateBackground,
      border: colors.moderateBorder,
      headline: "Steady State",
      guidance: "Maintain aerobic capacity with moderate, steady effort.",
    },
    recover: {
      score: "42",
      badge: "RECOVER",
      color: colors.recover,
      bg: colors.recoverBackground,
      border: colors.recoverBorder,
      headline: "Rest & Restore",
      guidance: "Keep physical load low. Prioritize mobility and an early bedtime.",
    },
  };

  const current = decisionData[activeDecision];

  return (
    <View style={styles.cardContainer}>
      <View style={styles.tabRow}>
        {(["push", "moderate", "recover"] as const).map((key) => {
          const isActive = activeDecision === key;
          const label = key.toUpperCase();
          const tabColor = key === "push" ? colors.push : key === "moderate" ? colors.moderate : colors.recover;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveDecision(key)}
              style={[
                styles.tabButton,
                isActive && { borderColor: tabColor, backgroundColor: colors.surfaceElevated },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${label} decision preview`}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  isActive && { color: tabColor, fontWeight: typography.weights.bold },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.decisionPreviewBox, { backgroundColor: current.bg, borderColor: current.border }]}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreValue, { color: current.color }]}>{current.score}</Text>
          <View style={[styles.badgePill, { backgroundColor: current.color }]}>
            <Text style={styles.badgePillText}>{current.badge}</Text>
          </View>
        </View>
        <Text style={[styles.previewHeadline, { color: current.color }]}>{current.headline}</Text>
        <Text style={styles.previewGuidance}>{current.guidance}</Text>
      </View>
      <Text style={styles.microHint}>Tap PUSH, MODERATE, or RECOVER to preview</Text>
    </View>
  );
}

// Visual 2: Four Essential Signals Grid
export function SignalsGridVisual() {
  const signals = [
    { title: "HRV (40%)", desc: "Autonomic readiness", icon: "💓", stat: "68 ms" },
    { title: "Resting HR (30%)", desc: "Cardiovascular rest", icon: "🫀", stat: "52 bpm" },
    { title: "Sleep (20%)", desc: "Energy restoration", icon: "😴", stat: "7h 45m" },
    { title: "Activity (10%)", desc: "Yesterday's strain", icon: "⚡", stat: "Moderate" },
  ];

  return (
    <View style={styles.cardContainer}>
      <View style={styles.signalsGrid}>
        {signals.map((s, idx) => (
          <View key={idx} style={styles.signalCard}>
            <View style={styles.signalHeader}>
              <Text style={styles.signalIcon}>{s.icon}</Text>
              <Text style={styles.signalStat}>{s.stat}</Text>
            </View>
            <Text style={styles.signalTitle}>{s.title}</Text>
            <Text style={styles.signalDesc}>{s.desc}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.microHint}>Four essential signals — no 20-metric clutter</Text>
    </View>
  );
}

// Visual 3: Baseline Comparison Visual
export function BaselineComparisonVisual() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.baselineBox}>
        <View style={styles.baselineHeaderRow}>
          <View>
            <Text style={styles.baselineTag}>YOUR 14-DAY BASELINE</Text>
            <Text style={styles.baselineMetricName}>Heart Rate Variability</Text>
          </View>
          <View style={styles.baselineDeltaBadge}>
            <Text style={styles.baselineDeltaText}>↑ 6.3% higher</Text>
          </View>
        </View>

        <View style={styles.barCompareContainer}>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Your Normal</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: "70%", backgroundColor: colors.textMuted }]} />
            </View>
            <Text style={styles.barValue}>64 ms</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Today</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: "76%", backgroundColor: colors.push }]} />
            </View>
            <Text style={[styles.barValue, { color: colors.push }]}>68 ms</Text>
          </View>
        </View>

        <View style={styles.baselineFooter}>
          <Text style={styles.baselineFooterText}>
            ✓ Graded strictly against your body, never a population average.
          </Text>
        </View>
      </View>
      <Text style={styles.microHint}>Your normal matters more than someone else's</Text>
    </View>
  );
}

// Visual 4: Actionable Tri-Pillar Plan
export function TodaysPlanVisual() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.planCard}>
        <Text style={styles.planCardTitle}>TODAY'S ACTION PLAN</Text>

        <View style={styles.planRow}>
          <View style={styles.planIconWrapper}>
            <Text style={styles.planIcon}>🏃</Text>
          </View>
          <View style={styles.planTextWrapper}>
            <Text style={styles.planPillar}>Training</Text>
            <Text style={styles.planDetail}>High-intensity interval or tempo work is optimal.</Text>
          </View>
        </View>

        <View style={styles.planDivider} />

        <View style={styles.planRow}>
          <View style={styles.planIconWrapper}>
            <Text style={styles.planIcon}>🚶</Text>
          </View>
          <View style={styles.planTextWrapper}>
            <Text style={styles.planPillar}>Movement</Text>
            <Text style={styles.planDetail}>Normal volume, 8,000–10,000 active steps.</Text>
          </View>
        </View>

        <View style={styles.planDivider} />

        <View style={styles.planRow}>
          <View style={styles.planIconWrapper}>
            <Text style={styles.planIcon}>😴</Text>
          </View>
          <View style={styles.planTextWrapper}>
            <Text style={styles.planPillar}>Recovery</Text>
            <Text style={styles.planDetail}>Maintain standard wind-down and 8h sleep window.</Text>
          </View>
        </View>
      </View>
      <Text style={styles.microHint}>Direct instructions ready before your morning workout</Text>
    </View>
  );
}

// Visual 5: Transparent Point Contribution Breakdown
export function TransparencyBreakdownVisual() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownTitle}>CALCULATION BREAKDOWN</Text>
          <Text style={styles.breakdownScore}>92 / 100</Text>
        </View>

        <View style={styles.pointRow}>
          <Text style={styles.pointName}>Heart Rate Variability</Text>
          <Text style={styles.pointValue}>38 / 40 pts</Text>
        </View>
        <View style={styles.pointRow}>
          <Text style={styles.pointName}>Resting Heart Rate</Text>
          <Text style={styles.pointValue}>28 / 30 pts</Text>
        </View>
        <View style={styles.pointRow}>
          <Text style={styles.pointName}>Sleep Duration</Text>
          <Text style={styles.pointValue}>18 / 20 pts</Text>
        </View>
        <View style={styles.pointRow}>
          <Text style={styles.pointName}>Activity Strain</Text>
          <Text style={styles.pointValue}>8 / 10 pts</Text>
        </View>

        <View style={styles.breakdownDivider} />

        <View style={styles.pointTotalRow}>
          <Text style={styles.pointTotalLabel}>Total Daily Score</Text>
          <Text style={styles.pointTotalValue}>92 / 100 ● PUSH</Text>
        </View>
      </View>
      <Text style={styles.microHint}>No mystery formulas — you can always see the math</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    paddingVertical: spacing.xs,
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  tabButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  decisionPreviewBox: {
    padding: spacing.base,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
  },
  badgePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  badgePillText: {
    color: colors.textInverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  previewHeadline: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xxs,
  },
  previewGuidance: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
  },
  microHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  signalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  signalCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  signalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xxs,
  },
  signalIcon: {
    fontSize: 18,
  },
  signalStat: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  signalTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  signalDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  baselineBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.base,
  },
  baselineHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  baselineTag: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  baselineMetricName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  baselineDeltaBadge: {
    backgroundColor: colors.pushBackground,
    borderColor: colors.pushBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  baselineDeltaText: {
    fontSize: 11,
    color: colors.push,
    fontWeight: typography.weights.bold,
  },
  barCompareContainer: {
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  barLabel: {
    width: 72,
    fontSize: 11,
    color: colors.textSecondary,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  barValue: {
    width: 44,
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: "right",
  },
  baselineFooter: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  baselineFooterText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.base,
  },
  planCardTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  planIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  planIcon: {
    fontSize: 14,
  },
  planTextWrapper: {
    flex: 1,
  },
  planPillar: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  planDetail: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  planDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xs,
    marginLeft: 36,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.base,
  },
  breakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  breakdownTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  breakdownScore: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.push,
  },
  pointRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  pointName: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  pointValue: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  pointTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  pointTotalLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  pointTotalValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.push,
  },
});
