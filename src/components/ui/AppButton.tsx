import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "@/constants";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.textPrimary,
          borderWidth: 1,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      case "danger":
        return {
          backgroundColor: colors.error,
          borderWidth: 0,
        };
      case "primary":
      default:
        return {
          backgroundColor: colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "secondary":
        return { color: colors.textPrimary };
      case "outline":
        return { color: colors.textPrimary };
      case "ghost":
        return { color: colors.textSecondary };
      case "danger":
        return { color: colors.textInverse };
      case "primary":
      default:
        return { color: colors.textInverse };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.button,
        getContainerStyle(),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.textInverse : colors.textPrimary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextStyle(),
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.disabled,
    borderColor: "transparent",
  },
  disabledText: {
    color: colors.disabledText,
  },
});
