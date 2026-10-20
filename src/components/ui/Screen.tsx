import React, { ReactNode } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StatusBar,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: Edge[];
  backgroundColor?: string;
  statusBarStyle?: "light-content" | "dark-content";
}

export function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  edges = ["top", "left", "right", "bottom"],
  backgroundColor = colors.background,
  statusBarStyle = "dark-content",
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor }, style]}
    >
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        {scroll ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.content, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, contentContainerStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
});
