import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, AppButton, AppTextInput } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { authService } from "@/services/authService";
import { validateEmail } from "@/lib/validation";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReset = async () => {
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Please enter a valid email.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await authService.resetPassword(email.trim());

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setSuccessMessage(
        "Password reset instructions have been sent to your email."
      );
    }
    setLoading(false);
  };

  return (
    <Screen scroll>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Card style={styles.card}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter your account email to receive a password reset link.
        </Text>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {successMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <AppTextInput
          label="Email address"
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />

        <AppButton
          title="Send reset link"
          onPress={handleReset}
          loading={loading}
          style={styles.button}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  card: {
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    marginTop: spacing.xxs,
    lineHeight: typography.sizes.sm * 1.4,
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
  successContainer: {
    backgroundColor: colors.successBackground,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  successText: {
    color: colors.success,
    fontSize: typography.sizes.sm,
  },
  button: {
    marginTop: spacing.xs,
  },
});
