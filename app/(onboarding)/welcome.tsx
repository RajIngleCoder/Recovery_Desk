import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, AppButton } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingWalkthrough } from "@/components/onboarding";

export default function WelcomeScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleStartSetup = () => {
    router.push("/(onboarding)/profile");
  };

  return (
    <Screen scroll>
      <OnboardingWalkthrough
        onComplete={handleStartSetup}
        onSkip={handleStartSetup}
      />

      <Card variant="muted" style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>Wellness Notice</Text>
        <Text style={styles.disclaimerText}>
          Recovery Desk provides general athletic & recovery insights based on your entries. It does not provide medical diagnoses or replace clinical advice.
        </Text>
      </Card>

      <AppButton
        title="Sign out"
        variant="ghost"
        onPress={signOut}
        style={styles.signOutButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  disclaimerCard: {
    padding: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  disclaimerTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginBottom: spacing.xxs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
  },
  signOutButton: {
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
});
