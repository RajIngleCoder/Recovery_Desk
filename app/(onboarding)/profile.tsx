import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, AppButton, AppTextInput } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingProfileStep() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const initialName =
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    (user?.email ? user.email.split("@")[0] : "");

  const [displayName, setDisplayName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Please enter your name or nickname.");
      return;
    }

    if (trimmed.length > 50) {
      setError("Name must not exceed 50 characters.");
      return;
    }

    setError(null);
    router.push({
      pathname: "/(onboarding)/goal",
      params: { displayName: trimmed },
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
        <Text style={styles.stepIndicator}>Step 1 of 3</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: "33%" }]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.subtitle}>
          This name will appear on your morning recovery dashboard.
        </Text>
      </View>

      <Card style={styles.card}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <AppTextInput
          label="Display Name"
          placeholder="e.g., Alex"
          value={displayName}
          autoFocus
          onChangeText={(text) => {
            setDisplayName(text);
            if (error) setError(null);
          }}
          hint="You can always change this later in Settings."
        />

        <AppButton
          title="Continue"
          onPress={handleNext}
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
  },
  button: {
    marginTop: spacing.lg,
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
