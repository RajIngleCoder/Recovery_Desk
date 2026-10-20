import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { AppTextInput } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";

interface NotesSectionProps {
  notes: string;
  error?: string;
  onChangeNotes: (text: string) => void;
}

export function NotesSection({ notes, error, onChangeNotes }: NotesSectionProps) {
  return (
    <>
      <View style={[styles.sectionHeaderRow, styles.marginTopLg]}>
        <Text style={styles.sectionHeading}>NOTES (OPTIONAL)</Text>
        <Text style={styles.charCounter}>{notes.length}/500</Text>
      </View>
      <AppTextInput
        placeholder="Any physical sensations, travel, soreness, or context..."
        multiline
        numberOfLines={3}
        maxLength={500}
        value={notes}
        onChangeText={onChangeNotes}
        error={error}
        style={styles.notesInput}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  sectionHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  marginTopLg: {
    marginTop: spacing.lg,
  },
  charCounter: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
