import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, AppButton, AppTextInput, BrandLogo } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { validateSignIn } from "@/lib/validation";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    const validation = validateSignIn({ email, password });
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Please check your inputs.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await signIn(email.trim(), password);

    if (result.error) {
      setErrorMessage(result.error);
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your private recovery account</Text>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

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
          placeholder="Enter your password"
          isPassword
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errorMessage) setErrorMessage(null);
          }}
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
          style={styles.forgotPassword}
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        <AppButton
          title="Sign in"
          onPress={handleSignIn}
          loading={loading}
          style={styles.signInButton}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
          <Text style={styles.footerLink}>Get started</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginVertical: spacing.xxl,
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
    maxWidth: 300,
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
    lineHeight: typography.sizes.sm * 1.4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    minHeight: 44,
    justifyContent: "center",
  },
  forgotPasswordText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  signInButton: {
    marginTop: spacing.xs,
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
});
