import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, AppButton, AppTextInput, BrandLogo } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { validateSignUp } from "@/lib/validation";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    const validation = validateSignUp({
      email,
      password,
      confirmPassword,
      displayName,
    });

    if (!validation.isValid) {
      setErrorMessage(validation.error || "Please check your inputs.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await signUp(
      email.trim(),
      password,
      displayName.trim() || undefined
    );

    if (result.error) {
      setErrorMessage(result.error);
      setLoading(false);
    } else if (result.requiresEmailVerification) {
      setSuccessMessage(
        "Account created! Please check your email to confirm your account before signing in."
      );
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.brandHeaderRow}>
          <BrandLogo size={36} />
          <Text style={styles.brandTitle}>Recovery Desk</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Track your daily recovery decisions</Text>

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
          label="Your name (optional)"
          placeholder="e.g., Sarah"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <AppTextInput
          label="Email address"
          placeholder="you@yourinbox.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />

        <AppTextInput
          label="Password"
          placeholder="At least 6 characters"
          isPassword
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />

        <AppTextInput
          label="Confirm password"
          placeholder="Re-enter your password"
          isPassword
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />

        <AppButton
          title="Create account"
          onPress={handleSignUp}
          loading={loading}
          style={styles.button}
        />

        <Text style={styles.legalNoticeText}>
          By continuing, you agree to our{" "}
          <Text
            style={styles.legalNoticeLink}
            onPress={() => Linking.openURL("https://recovery-desk-10d85.web.app/terms")}
          >
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text
            style={styles.legalNoticeLink}
            onPress={() => Linking.openURL("https://recovery-desk-10d85.web.app/privacy")}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
          <Text style={styles.footerLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  brandHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  brandTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: typography.sizes.sm * 1.5,
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
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: spacing.xxs,
  },
  errorContainer: {
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 8,
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
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  successText: {
    color: colors.success,
    fontSize: typography.sizes.sm,
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  footerLink: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xxs,
  },
  legalNoticeText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 18,
  },
  legalNoticeLink: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
    textDecorationLine: "underline",
  },
});
