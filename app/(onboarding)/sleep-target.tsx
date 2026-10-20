import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen, Card, AppButton, AppTextInput } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/profileService";
import { validateOnboarding } from "@/lib/validation";
import { GoalType } from "@/types/database";

const SLEEP_PRESETS = ["7.0", "7.5", "8.0", "8.5", "9.0"];

export default function OnboardingSleepTargetStep() {
  const router = useRouter();
  const params = useLocalSearchParams<{ displayName?: string; goal?: string }>();
  const displayName = params.displayName || "Athlete";
  const goal = (params.goal as GoalType) || "general";

  const { user, refreshProfile } = useAuth();

  const [sleepTarget, setSleepTarget] = useState("8.0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!user) {
      setError("Session expired. Please sign in again.");
      return;
    }

    const validation = validateOnboarding({
      displayName,
      goal,
      sleepTargetHours: sleepTarget,
    });

    if (!validation.isValid) {
      setError(validation.error || "Please check your sleep target.");
      return;
    }

    setLoading(true);
    setError(null);

    const targetHours = parseFloat(sleepTarget);

    const result = await profileService.completeOnboarding(user.id, {
      displayName,
      goal,
      sleepTargetHours: targetHours,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      await refreshProfile();
      // RouteGuard will automatically route to /(app)/(tabs)
    }
  };

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 3 of 3</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: "100%" }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>What is your ideal sleep target?</Text>
        <Text style={styles.subtitle}>
          How many hours of sleep do you typically aim for each night?
        </Text>
      </View>

      <Card style={styles.card}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Quick Presets</Text>
        <View style={styles.presetsRow}>
          {SLEEP_PRESETS.map((preset) => {
            const isSelected = sleepTarget === preset;
            return (
              <TouchableOpacity
                key={preset}
                onPress={() => {
                  setSleepTarget(preset);
                  if (error) setError(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${preset} hours`}
                style={[
                  styles.presetPill,
                  isSelected && styles.presetPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    isSelected && styles.presetTextSelected,
                  ]}
                >
                  {preset}h
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppTextInput
          label="Target Duration"
          placeholder="8.0"
          unit="hours"
          keyboardType="decimal-pad"
          value={sleepTarget}
          onChangeText={(text) => {
            setSleepTarget(text);
            if (error) setError(null);
          }}
          hint="Must be between 4.0 and 16.0 hours."
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How this is used</Text>
          <Text style={styles.infoText}>
            Your actual baseline will be established from the recovery data you log over time. This target provides a starting reference while your personal baseline is learning.
          </Text>
        </View>

        <AppButton
          title="Complete Setup"
          onPress={handleFinish}
          loading={loading}
          style={styles.button}
        />
      </Card>
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
  card: {
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  presetsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  presetPill: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  presetPillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  presetTextSelected: {
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  infoTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xxs,
  },
  infoText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
  },
  button: {
    marginTop: spacing.md,
  },
  errorContainer: {
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
  },
});
