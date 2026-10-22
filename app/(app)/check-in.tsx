import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Alert,
  BackHandler,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { Screen, Card, AppButton, LoadingState, ConfirmModal } from "@/components/ui";
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

  const navigation = useNavigation();
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const isBypassingGuardRef = useRef<boolean>(false);
  const pendingActionRef = useRef<any>(null);

  // 1. Catch React Navigation transitions (iOS edge swipe, navigation actions)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isBypassingGuardRef.current || !isDirty || saveSuccess) {
        return;
      }
      e.preventDefault();
      pendingActionRef.current = e.data.action;
      setShowDiscardModal(true);
    });

    return unsubscribe;
  }, [navigation, isDirty, saveSuccess]);

  // 2. Catch Android hardware back button & system gesture back
  useEffect(() => {
    const onBackPress = () => {
      if (isDirty && !saveSuccess && !isBypassingGuardRef.current) {
        pendingActionRef.current = null;
        setShowDiscardModal(true);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [isDirty, saveSuccess]);

  // 3. On-screen Cancel button
  const handleCancel = () => {
    if (isDirty && !saveSuccess) {
      pendingActionRef.current = null;
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  };

  // 4. Confirm discard: exit once cleanly with zero duplicate prompts
  const handleConfirmDiscard = () => {
    isBypassingGuardRef.current = true;
    setShowDiscardModal(false);
    if (pendingActionRef.current) {
      navigation.dispatch(pendingActionRef.current);
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
