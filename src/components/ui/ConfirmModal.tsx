import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/constants";
import { AppButton } from "./AppButton";

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  containerStyle?: ViewStyle;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  iconName = "alert-circle-outline",
  iconColor,
  iconBackgroundColor,
  loading = false,
  onConfirm,
  onCancel,
  containerStyle,
}: ConfirmModalProps) {
  const isDestructive = confirmVariant === "danger";
  const defaultIconColor = isDestructive ? colors.error : colors.primary;
  const defaultBgColor = isDestructive ? colors.errorBackground : colors.primaryLight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialogCard, containerStyle]}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: iconBackgroundColor || defaultBgColor },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={28}
                  color={iconColor || defaultIconColor}
                />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonStack}>
                <AppButton
                  title={confirmText}
                  variant={confirmVariant}
                  onPress={onConfirm}
                  loading={loading}
                  style={styles.actionButton}
                />
                <AppButton
                  title={cancelText}
                  variant="outline"
                  onPress={onCancel}
                  disabled={loading}
                  style={styles.actionButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(31, 41, 51, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.sizes.sm * 1.5,
    marginBottom: spacing.xl,
  },
  buttonStack: {
    width: "100%",
    gap: spacing.sm,
  },
  actionButton: {
    width: "100%",
  },
});
