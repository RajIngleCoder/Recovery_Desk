import React from "react";
import {
  StyleSheet,
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen, Card, AppButton, LoadingState } from "@/components/ui";
import { colors, spacing, typography } from "@/constants";
import { useCheckInForm } from "@/hooks/useCheckInForm";
import {
  SleepSection,
  BiomarkersSection,
  ActivityLoadSection,
  NotesSection,
  DatePickerModal,
  CheckInDateSelector,
  CheckInFeedbackBanners,
} from "@/components/check-in";

export default function CheckInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; id?: string }>();

  const {
    selectedDate,
    todayDate,
    yesterdayDateStr,
    isCustomDate,
    pastDatesList,
    existingEntryId,
    isLoadingInitial,
    showDatePickerModal,
    setShowDatePickerModal,
    sleepHours,
    setSleepHours,
    sleepMinutes,
    setSleepMinutes,
    sleepScore,
    setSleepScore,
    hrv,
    setHrv,
    restingHr,
    setRestingHr,
    activityLoad,
    setActivityLoad,
    notes,
    setNotes,
    fieldErrors,
    clearFieldError,
    generalError,
    saveSuccess,
    isDirty,
    isSubmitting,
    isDeleting,
    calculatedSleep,
    handleSelectDate,
    handleSubmit,
    handleDeleteConfirm,
  } = useCheckInForm({
    initialDateParam: params.date,
    initialIdParam: params.id,
  });

  const handleCancel = () => {
    if (isDirty && !saveSuccess) {
      Alert.alert(
        "Discard Check-In?",
        "You have unsaved recovery metrics. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel check-in"
          >
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>
            {existingEntryId ? "Edit Check-In" : "Daily Check-In"}
          </Text>
          <View style={styles.navPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <CheckInDateSelector
            selectedDate={selectedDate}
            todayDate={todayDate}
            yesterdayDateStr={yesterdayDateStr}
            isCustomDate={isCustomDate}
            existingEntryId={existingEntryId}
            onSelectDate={handleSelectDate}
            onOpenPicker={() => setShowDatePickerModal(true)}
          />

          <CheckInFeedbackBanners
            generalError={generalError}
            saveSuccess={saveSuccess}
          />

          {isLoadingInitial ? (
            <View style={styles.loadingContainer}>
              <LoadingState message="Loading check-in..." />
            </View>
          ) : (
            <Card style={styles.formCard}>
              <SleepSection
                sleepHours={sleepHours}
                sleepMinutes={sleepMinutes}
                sleepScore={sleepScore}
                calculatedSleep={calculatedSleep()}
                fieldErrors={fieldErrors}
                onChangeSleepHours={(text) => {
                  setSleepHours(text);
                  clearFieldError("sleep");
                }}
                onChangeSleepMinutes={(text) => {
                  setSleepMinutes(text);
                  clearFieldError("sleep");
                }}
                onChangeSleepScore={(text) => {
                  setSleepScore(text);
                  clearFieldError("sleepScore");
                }}
              />

              <BiomarkersSection
                hrv={hrv}
                restingHr={restingHr}
                fieldErrors={fieldErrors}
                onChangeHrv={(text) => {
                  setHrv(text);
                  clearFieldError("hrv");
                }}
                onChangeRestingHr={(text) => {
                  setRestingHr(text);
                  clearFieldError("restingHr");
                }}
              />

              <ActivityLoadSection
                activityLoad={activityLoad}
                error={fieldErrors.activityLoad}
                onSelect={setActivityLoad}
              />

              <NotesSection
                notes={notes}
                error={fieldErrors.notes}
                onChangeNotes={(text) => {
                  setNotes(text);
                  clearFieldError("notes");
                }}
              />

              <AppButton
                title={
                  existingEntryId
                    ? "Update Check-In"
                    : "Save Recovery Metrics"
                }
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting || isDeleting}
                style={styles.submitButton}
              />

              {existingEntryId && (
                <AppButton
                  title="Delete Entry"
                  variant="danger"
                  onPress={handleDeleteConfirm}
                  loading={isDeleting}
                  disabled={isSubmitting || isDeleting}
                  style={styles.deleteButton}
                />
              )}
            </Card>
          )}
        </ScrollView>

        <DatePickerModal
          visible={showDatePickerModal}
          selectedDate={selectedDate}
          pastDatesList={pastDatesList}
          onSelectDate={handleSelectDate}
          onClose={() => setShowDatePickerModal(false)}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  closeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xxs,
    minHeight: 44,
    justifyContent: "center",
  },
  closeText: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
  navTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  navPlaceholder: {
    width: 48,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    minHeight: 220,
  },
  formCard: {
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  deleteButton: {
    marginTop: spacing.md,
  },
});
