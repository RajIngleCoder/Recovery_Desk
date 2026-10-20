import React from "react";
import { StyleSheet, Text } from "react-native";
import { Card } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";

export interface CheckInFeedbackBannersProps {
  generalError: string | null;
  saveSuccess: boolean;
}

export function CheckInFeedbackBanners({
  generalError,
  saveSuccess,
}: CheckInFeedbackBannersProps) {
  return (
    <>
      {generalError && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorCardText}>{generalError}</Text>
        </Card>
      )}
      {saveSuccess && (
        <Card style={styles.successCard}>
          <Text style={styles.successCardText}>
            Recovery data saved successfully! Redirecting...
          </Text>
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  errorCard: {
    padding: spacing.base,
    marginBottom: spacing.md,
    backgroundColor: colors.recoverBackground,
    borderColor: colors.recoverBorder,
    borderWidth: 1,
  },
  errorCardText: {
    color: colors.recover,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  successCard: {
    padding: spacing.base,
    marginBottom: spacing.md,
    backgroundColor: colors.pushBackground,
    borderColor: colors.pushBorder,
    borderWidth: 1,
  },
  successCardText: {
    color: colors.push,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
