import React from "react";
import { StyleSheet, View, Text, Switch, TouchableOpacity, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Card, AppButton } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/profileService";
import { useDemoMode } from "@/features/demo/DemoContext";

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { isDemoMode, toggleDemoMode, demoProfile, demoScenario, setDemoScenario } = useDemoMode();

  const isDemoActive = Boolean(__DEV__ && isDemoMode);
  const displayEmail = isDemoActive ? demoProfile.email : (user?.email || "Not set");
  const displayName = isDemoActive ? demoProfile.displayName : (profile?.display_name || "Athlete");
  const displayGoal = isDemoActive
    ? demoProfile.goal
    : profile?.goal
    ? profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)
    : "General";
  const displaySleep = isDemoActive
    ? demoProfile.sleepTarget
    : profile?.sleep_target_hours
    ? `${profile.sleep_target_hours}h`
    : "8.0h";

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account & Health Data",
      "Are you sure you want to permanently delete your Recovery Desk account and all associated metrics, baselines, and logs? This action is irreversible.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await profileService.deleteAccount();
              if (res.error) {
                Alert.alert("Error", res.error);
                return;
              }
              await signOut();
              Alert.alert(
                "Account Deleted",
                "Your account and personal recovery data have been permanently deleted."
              );
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to complete account deletion.");
            }
          },
        },
      ]
    );
  };

  return (
    <Screen scroll edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Settings</Text>
        <Text style={styles.subtitle}>Account preferences and wellness guidelines</Text>
      </View>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{displayEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{displayName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Goal</Text>
          <Text style={styles.value}>{displayGoal}</Text>
        </View>
        <View style={[styles.row, styles.noBorder]}>
          <Text style={styles.label}>Sleep Target</Text>
          <Text style={styles.value}>{displaySleep}</Text>
        </View>
      </Card>
      {__DEV__ && (
        <Card style={styles.sectionCard}>
          <View style={styles.demoModeHeader}>
            <View style={styles.demoModeTitleRow}>
              <Ionicons name="camera-outline" size={16} color={colors.primary} />
              <Text style={styles.sectionTitleNoMargin}>Marketing Screenshot Mode</Text>
          </View>
          <Switch
            value={isDemoMode}
            onValueChange={toggleDemoMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>
        <Text style={styles.demoModeDescription}>
          Masks personal email and name with clean marketing defaults (Alex Morgan • alex@example.com) for App Store and promotional screenshots.
        </Text>
        {isDemoMode && (
          <View style={styles.demoControlsContainer}>
            <View style={styles.demoActiveBadge}>
              <Text style={styles.demoActiveText}>● DEMO PERSONA ACTIVE (ALEX MORGAN)</Text>
            </View>

            <View style={styles.scenarioSelector}>
              <Text style={styles.scenarioLabel}>QUICK-SWITCH SCREENSHOT SCENARIO</Text>
              <View style={styles.scenarioRow}>
                {(["push", "moderate", "recover"] as const).map((sc) => {
                  const isSelected = demoScenario === sc;
                  const label =
                    sc === "push"
                      ? "PUSH (98)"
                      : sc === "moderate"
                      ? "MODERATE (78)"
                      : "RECOVER (42)";
                  const scColor =
                    sc === "push"
                      ? colors.push
                      : sc === "moderate"
                      ? colors.moderate
                      : colors.recover;
                  const scBg =
                    sc === "push"
                      ? colors.pushBackground
                      : sc === "moderate"
                      ? colors.moderateBackground
                      : colors.recoverBackground;

                  return (
                    <TouchableOpacity
                      key={sc}
                      onPress={() => setDemoScenario(sc)}
                      style={[
                        styles.scenarioBtn,
                        isSelected && {
                          borderColor: scColor,
                          backgroundColor: scBg,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Set ${label} scenario`}
                    >
                      <Text
                        style={[
                          styles.scenarioBtnText,
                          isSelected && {
                            color: scColor,
                            fontWeight: typography.weights.bold,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.scenarioHint}>
                Active: {demoScenario.toUpperCase()} — Today tab will display this clean scenario.
              </Text>
            </View>
          </View>
        )}
      </Card>
      )}

      <Card variant="muted" style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Data Connections</Text>
        <Text style={styles.comingSoonText}>
          Direct integrations with Apple Health, Health Connect, WHOOP, and Oura are planned for post-MVP releases.
        </Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.comingSoonBadge}>COMING LATER</Text>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Legal & Support</Text>

        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL("https://recovery-desk-10d85.web.app/privacy")}
          accessibilityRole="link"
          accessibilityLabel="Open Privacy Policy"
        >
          <View style={styles.legalLabelRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.legalLabel}>Privacy Policy</Text>
          </View>
          <Ionicons name="open-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL("https://recovery-desk-10d85.web.app/terms")}
          accessibilityRole="link"
          accessibilityLabel="Open Terms and Conditions"
        >
          <View style={styles.legalLabelRow}>
            <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.legalLabel}>Terms & Conditions</Text>
          </View>
          <Ionicons name="open-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => Linking.openURL("https://recovery-desk-10d85.web.app/support")}
          accessibilityRole="link"
          accessibilityLabel="Open Support Center"
        >
          <View style={styles.legalLabelRow}>
            <Ionicons name="help-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.legalLabel}>Support & Help Center</Text>
          </View>
          <Ionicons name="open-outline" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.legalRow, styles.noBorder]}
          onPress={handleDeleteAccount}
          accessibilityRole="button"
          accessibilityLabel="Delete Account and Data"
        >
          <View style={styles.legalLabelRow}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={[styles.legalLabel, { color: colors.error }]}>Delete Account & Data</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </Card>

      <Card variant="muted" style={styles.sectionCard}>
        <Text style={styles.disclaimerTitle}>Wellness Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          Recovery Desk provides general wellness information based on the data you enter. It is not medical advice and does not diagnose or treat health conditions. If you have health concerns, consult a qualified healthcare professional.
        </Text>
      </Card>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Recovery Desk MVP v1.0.0</Text>
      </View>

      <AppButton
        title="Sign out"
        variant="danger"
        onPress={signOut}
        style={styles.signOutButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  demoModeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  demoModeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitleNoMargin: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  demoModeDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xxs,
  },
  demoControlsContainer: {
    marginTop: spacing.md,
  },
  scenarioSelector: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  scenarioLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  scenarioRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  scenarioBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  scenarioBtnText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  scenarioHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  demoActiveBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(43, 138, 62, 0.1)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  demoActiveText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.push,
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  comingSoonText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
    marginBottom: spacing.sm,
  },
  badgeContainer: {
    alignSelf: "flex-start",
  },
  comingSoonBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xs,
    overflow: "hidden",
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
  versionContainer: {
    alignItems: "center",
    marginVertical: spacing.base,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  legalLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  legalLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  signOutButton: {
    marginBottom: spacing.xxl,
  },
});
