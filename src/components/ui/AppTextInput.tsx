import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants";

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  unit?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export function AppTextInput({
  label,
  error,
  hint,
  unit,
  isPassword,
  containerStyle,
  style,
  secureTextEntry,
  ...rest
}: AppTextInputProps) {
  const hasError = Boolean(error);
  const isPasswordField = Boolean(isPassword || secureTextEntry);
  const [isSecure, setIsSecure] = useState(isPasswordField);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          hasError && styles.inputWrapperError,
          rest.editable === false && styles.inputWrapperDisabled,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          secureTextEntry={isPasswordField ? isSecure : false}
          {...rest}
        />
        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setIsSecure((prev) => !prev)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={isSecure ? "Show password" : "Hide password"}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={isSecure ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.surfaceMuted,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    minHeight: 44,
  },
  eyeButton: {
    padding: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.xs,
  },
  unit: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginLeft: spacing.sm,
    fontWeight: typography.weights.medium,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  hintText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
