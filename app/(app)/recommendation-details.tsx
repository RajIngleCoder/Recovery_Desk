import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppButton } from "@/components/ui/AppButton";
import { colors, radius, spacing, typography } from "@/constants";
import { calculateRecoveryDecision } from "@/domain/recovery/scoring";
import { ActivityLoadType, RecoveryStatusType, GoalType } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/features/demo/DemoContext";
import { formatSleepDuration } from "@/lib/date";
import { ContributorBalance, FactorDetailCard, ScoreCalculationDrawer } from "@/components/recommendation";

export default function RecommendationDetailsScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { isDemoMode, demoProfile } = useDemoMode();
  const userGoal = (isDemoMode ? demoProfile.goal?.toLowerCase() : profile?.goal) as GoalType | undefined;
  const params = useLocalSearchParams<{
    status?: string;
    score?: string;
    hrv?: string;
    hrvBaseline?: string;
    restingHr?: string;
    restingHrBaseline?: string;
    sleepHours?: string;
    sleepBaseline?: string;
    activityLoad?: string;
  }>();

  // Recalculate deterministic decision with complete factors
  const decision = calculateRecoveryDecision({
    hrv: params.hrv ? parseFloat(params.hrv) : 0,
    restingHr: params.restingHr ? parseFloat(params.restingHr) : 0,
    sleepHours: params.sleepHours ? parseFloat(params.sleepHours) : 0,
    activityLoad: (params.activityLoad as ActivityLoadType) || "moderate",
    hrvBaseline: params.hrvBaseline ? parseFloat(params.hrvBaseline) : undefined,
    restingHrBaseline: params.restingHrBaseline
      ? parseFloat(params.restingHrBaseline)
      : undefined,
    sleepBaseline: params.sleepBaseline ? parseFloat(params.sleepBaseline) : undefined,
    goal: userGoal,
  });

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

  const statusColor = getStatusColor();
  const statusBgColor = getStatusBgColor();

  return (
    <Screen scroll={true}>
      {/* Top Navigation Bar with Back Button */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Why This Recommendation?</Text>
          <Text style={styles.navSubtitle}>Backed by your personal 14-day baseline</Text>
        </View>
        <View style={styles.navPlaceholder} />
      </View>

      {/* Main Score & Decision Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.heroRow}>
          <View style={[styles.scoreHeroBox, { borderColor: statusColor, backgroundColor: statusBgColor }]}>
            <Text style={[styles.heroScoreText, { color: statusColor }]}>
              {Math.round(decision.score)}
            </Text>
            <Text style={styles.heroScoreDenom}>/100</Text>
          </View>
          <View style={styles.heroMeta}>
            <StatusBadge status={decision.status} size="lg" />
            <Text style={styles.tierSubtext}>
              {decision.status === "PUSH"
                ? "Prime Readiness (85\u2013100)"
                : decision.status === "MODERATE"
                ? "Moderate Readiness (60\u201384)"
                : "Recovery Priority (0\u201359)"}
            </Text>
          </View>
        </View>

        <Text style={styles.summaryTitle}>{decision.title}</Text>
        <Text style={styles.summaryBody}>{decision.body}</Text>

        {/* Factual Decision Reason Box */}
        <View style={styles.reasonCard}>
          <Text style={styles.reasonLabel}>WHAT DROVE THIS RECOMMENDATION?</Text>
          <Text style={styles.reasonText}>"{decision.reason}"</Text>
        </View>
      </Card>

      {/* WHAT THIS MEANS Plain English Interpretation */}
      <Text style={styles.sectionHeading}>WHAT THIS MEANS</Text>
      <Card style={styles.whatThisMeansCard}>
        <Text style={styles.whatThisMeansText}>
          {decision.status === "PUSH"
            ? "Your key recovery signals are operating at or above your 14-day norm. Your body is primed and ready to take on demanding workouts or a hard training day."
            : decision.status === "MODERATE"
            ? "Your resting heart rate is at your normal level, while HRV and sleep are slightly below your recent baseline. That's why today's recommendation is MODERATE rather than PUSH."
            : "Your recovery signals and sleep are noticeably below your normal baseline today. Pushing hard today would build up fatigue instead of fitness, so prioritizing rest will give your body time to recharge."}
        </Text>
      </Card>

      {/* Contributor Balance: What Helped vs What Held Back */}
      <ContributorBalance factors={decision.factors} />

      {/* Per-Factor Detail Cards */}
      <Text style={styles.sectionHeading}>WHAT DROVE TODAY'S SCORE?</Text>
      {decision.factors.map((factor) => (
        <FactorDetailCard key={factor.metric} factor={factor} />
      ))}

      {/* YOUR 14-DAY BASELINES Consolidated Box */}
      <Text style={styles.sectionHeading}>YOUR 14-DAY BASELINES</Text>
      <Card style={styles.baselinesSummaryCard}>
        <View style={styles.baselineCol}>
          <Text style={styles.baselineColLabel}>HRV BASELINE</Text>
          <Text style={styles.baselineColValue}>
            {params.hrvBaseline ? Math.round(parseFloat(params.hrvBaseline)) + " ms" : "67 ms"}
          </Text>
        </View>

        <View style={styles.baselineVerticalDivider} />

        <View style={styles.baselineCol}>
          <Text style={styles.baselineColLabel}>RESTING HR</Text>
          <Text style={styles.baselineColValue}>
            {params.restingHrBaseline ? Math.round(parseFloat(params.restingHrBaseline)) + " bpm" : "51 bpm"}
          </Text>
        </View>

        <View style={styles.baselineVerticalDivider} />

        <View style={styles.baselineCol}>
          <Text style={styles.baselineColLabel}>SLEEP BASELINE</Text>
          <Text style={styles.baselineColValue}>
            {params.sleepBaseline ? formatSleepDuration(parseFloat(params.sleepBaseline)) : "8h 00m"}
          </Text>
        </View>
      </Card>

      {/* Score Calculation Drawer */}
      <ScoreCalculationDrawer decision={decision} />

      {/* Non-Diagnostic Wellness Disclaimer */}
      <Card variant="muted" style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>Wellness Decision Support</Text>
        <Text style={styles.disclaimerBody}>
          Recovery Desk provides general wellness decision support based on your entered data.
          All formulas are product experimentation hypotheses and do not constitute clinical
          diagnosis or medical advice.
        </Text>
      </Card>

      <AppButton
        title="Done"
        onPress={() => router.back()}
        variant="primary"
        style={styles.doneButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: spacing.xs,
    minHeight: 44,
  },
  backText: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  navTitleContainer: {
    alignItems: "center",
  },
  navTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  navSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
    marginTop: 1,
  },
  navPlaceholder: {
    width: 60,
  },
  summaryCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  scoreHeroBox: {
    minWidth: 72,
    height: 60,
    borderRadius: radius.card,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  heroScoreText: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  heroScoreDenom: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginTop: -2,
  },
  heroMeta: {
    flex: 1,
    gap: 4,
  },
  tierSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  summaryBody: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  reasonCard: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.base,
    borderRadius: radius.card,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: spacing.xxs,
  },
  reasonText: {
    fontSize: typography.sizes.xs,
    fontStyle: "italic",
    color: colors.textPrimary,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  whatThisMeansCard: {
    padding: spacing.base,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  whatThisMeansText: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    fontWeight: typography.weights.medium,
  },
  baselinesSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  baselineCol: {
    flex: 1,
    alignItems: "center",
  },
  baselineColLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  baselineColValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  baselineVerticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  disclaimerCard: {
    padding: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  disclaimerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  disclaimerBody: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  doneButton: {
    marginBottom: spacing.xxl,
  },
});
