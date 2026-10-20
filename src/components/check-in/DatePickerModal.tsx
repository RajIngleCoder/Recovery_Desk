import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { colors, spacing, typography, radius } from "@/constants";

interface DatePickerItem {
  dateStr: string;
  label: string;
  subLabel: string;
}

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string;
  pastDatesList: DatePickerItem[];
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
}

export function DatePickerModal({
  visible,
  selectedDate,
  pastDatesList,
  onSelectDate,
  onClose,
}: DatePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Past Date</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalDateList} showsVerticalScrollIndicator={false}>
            {pastDatesList.map((item) => {
              const isSelected = item.dateStr === selectedDate;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={[
                    styles.dateListItem,
                    isSelected && styles.dateListItemActive,
                  ]}
                  onPress={() => onSelectDate(item.dateStr)}
                >
                  <View>
                    <Text
                      style={[
                        styles.dateListItemLabel,
                        isSelected && styles.dateListItemLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.dateListItemSub,
                        isSelected && styles.dateListItemSubActive,
                      ]}
                    >
                      {item.subLabel}
                    </Text>
                  </View>
                  {isSelected && (
                    <Text style={styles.dateListCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    width: "100%",
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  modalCloseBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  modalCloseText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  modalDateList: {
    padding: spacing.sm,
  },
  dateListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: 2,
  },
  dateListItemActive: {
    backgroundColor: colors.primaryLight,
  },
  dateListItemLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  dateListItemLabelActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  dateListItemSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  dateListItemSubActive: {
    color: colors.primary,
  },
  dateListCheckmark: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
