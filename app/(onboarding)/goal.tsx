import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen, Card, AppButton } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants";
import { GoalType } from "@/types/database";

interface GoalOption {
  type: GoalType;
  title: string;
  badge: string;
  description: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    type: "general",
    title: "General Recovery",
    badge: "BALANCE",
    description: "Balance daily stress, energy levels, and lifestyle recovery.",
  },
  {
    type: "training",
    title: "Training & Performance",
    badge: "ATHLETIC",
    description: "Optimize workout intensity, training sessions, and systemic fatigue.",
  },
  {
    type: "fitness",
    title: "Daily Fitness",
    badge: "CONSISTENCY",
    description: "Stay consistent with active routines, movement, and wellness.",
  },
];

export default function OnboardingGoalStep() {
  const router = useRouter();
  const params = useLocalSearchParams<{ displayName?: string }>();
  const displayName = params.displayName || "Athlete";

  const [selectedGoal, setSelectedGoal] = useState<GoalType>("general");

  const handleNext = () => {
    router.push({
      pathname: "/(onboarding)/sleep-target",
      params: {
        displayName,
        goal: selectedGoal,
      },
    });
  };

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 2 of 3</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: "66%" }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>What is your primary focus?</Text>
        <Text style={styles.subtitle}>
          Choose your core objective. You can adjust this anytime in your settings.
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {GOAL_OPTIONS.map((option) => {
          const isSelected = selectedGoal === option.type;
          return (
            <TouchableOpacity
              key={option.type}
              activeOpacity={0.8}
              onPress={() => setSelectedGoal(option.type)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {option.title}
                  </Text>
                  <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                    <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                      {option.badge}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <AppButton
        title="Continue"
        onPress={handleNext}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.xs,
    minHeight: 44,
    justifyContent: "center",
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  stepIndicator: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionTitleRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  optionTitleSelected: {
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  badgeSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  badgeTextSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginLeft: 36,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
  },
  button: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
});
