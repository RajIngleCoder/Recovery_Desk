import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, AppButton, AppTextInput, BrandLogo } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { validateSignUp, checkPasswordStrength } from "@/lib/validation";

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

  const passwordStrength = checkPasswordStrength(password);

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
          autoCorrect={false}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />

        <AppTextInput
          label="Password"
          placeholder="Min 8 chars, numbers & symbols"
          isPassword
          autoCorrect={false}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />
        {password.length > 0 && (
          <View style={styles.passwordCriteriaContainer}>
            <Text style={styles.criteriaTitle}>Password requirements:</Text>
            <View style={styles.criteriaRow}>
              <Ionicons
                name={passwordStrength.hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                size={14}
                color={passwordStrength.hasMinLength ? colors.push : colors.textMuted}
              />
              <Text style={[styles.criteriaText, passwordStrength.hasMinLength && styles.criteriaTextMet]}>
                At least 8 characters
              </Text>
            </View>
            <View style={styles.criteriaRow}>
              <Ionicons
                name={passwordStrength.hasLetter ? "checkmark-circle" : "ellipse-outline"}
                size={14}
                color={passwordStrength.hasLetter ? colors.push : colors.textMuted}
              />
              <Text style={[styles.criteriaText, passwordStrength.hasLetter && styles.criteriaTextMet]}>
                At least one letter (a-z, A-Z)
              </Text>
            </View>
            <View style={styles.criteriaRow}>
              <Ionicons
                name={passwordStrength.hasNumber ? "checkmark-circle" : "ellipse-outline"}
                size={14}
                color={passwordStrength.hasNumber ? colors.push : colors.textMuted}
              />
              <Text style={[styles.criteriaText, passwordStrength.hasNumber && styles.criteriaTextMet]}>
                At least one number (0-9)
              </Text>
            </View>
            <View style={styles.criteriaRow}>
              <Ionicons
                name={passwordStrength.hasSymbol ? "checkmark-circle" : "ellipse-outline"}
                size={14}
                color={passwordStrength.hasSymbol ? colors.push : colors.textMuted}
              />
              <Text style={[styles.criteriaText, passwordStrength.hasSymbol && styles.criteriaTextMet]}>
                At least one symbol (!@#$%...)
              </Text>
            </View>
          </View>
        )}

        <AppTextInput
          label="Confirm password"
          placeholder="Re-enter your password"
          isPassword
          autoCorrect={false}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />
        {confirmPassword.length > 0 && (
          <View style={styles.passwordFeedbackRow}>
            <Text
              style={[
                styles.feedbackText,
                password === confirmPassword && passwordStrength.isValid
                  ? styles.feedbackSuccess
                  : styles.feedbackError,
              ]}
            >
              {password === confirmPassword && passwordStrength.isValid
                ? "✓ Passwords match"
                : password !== confirmPassword
                ? "Passwords do not match"
                : "Complete all password requirements above"}
            </Text>
          </View>
        )}

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
  passwordCriteriaContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.sm,
    marginTop: -spacing.xs,
    marginBottom: spacing.base,
    gap: 4,
  },
  criteriaTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  criteriaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  criteriaText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  criteriaTextMet: {
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  passwordFeedbackRow: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  feedbackText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  feedbackSuccess: {
    color: colors.push,
  },
  feedbackError: {
    color: colors.error,
  },
  feedbackMuted: {
    color: colors.textSecondary,
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
