import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { recoveryService } from "@/services/recoveryService";
import {
  validateDailyMetricsInput,
  formatDailyMetricsError,
  DailyMetricsValidationErrors,
} from "@/lib/validation";
import {
  getTodayDateString,
  formatDisplayDate,
  decimalToHoursAndMinutes,
  hoursAndMinutesToDecimal,
  isValidDateString,
} from "@/lib/date";
import { ActivityLoadType } from "@/types/database";

export interface PastDateOption {
  dateStr: string;
  label: string;
  subLabel: string;
}

export interface UseCheckInFormOptions {
  initialDateParam?: string;
  initialIdParam?: string;
}

export function useCheckInForm(options?: UseCheckInFormOptions) {
  const router = useRouter();
  const { user, profile } = useAuth();

  // Date state
  const todayDate = getTodayDateString();
  const initialDate =
    options?.initialDateParam && isValidDateString(options.initialDateParam)
      ? options.initialDateParam
      : todayDate;
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);

  // Existing entry state
  const [existingEntryId, setExistingEntryId] = useState<string | null>(
    options?.initialIdParam || null
  );
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);

  // Form field states
  const [sleepHours, setSleepHours] = useState<string>("");
  const [sleepMinutes, setSleepMinutes] = useState<string>("");
  const [sleepScore, setSleepScore] = useState<string>("");
  const [hrv, setHrv] = useState<string>("");
  const [restingHr, setRestingHr] = useState<string>("");
  const [activityLoad, setActivityLoad] = useState<ActivityLoadType>("moderate");
  const [notes, setNotes] = useState<string>("");

  // Snapshot of loaded values to accurately detect unsaved changes
  const initialSnapshotRef = useRef<{
    sleepHours: string;
    sleepMinutes: string;
    sleepScore: string;
    hrv: string;
    restingHr: string;
    activityLoad: ActivityLoadType;
    notes: string;
  } | null>(null);

  // Feedback & mutation states
  const [fieldErrors, setFieldErrors] = useState<DailyMetricsValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load existing metrics for the selected date
  const loadExistingMetrics = useCallback(
    async (dateToLoad: string) => {
      if (!user?.id) return;
      setIsLoadingInitial(true);
      setGeneralError(null);
      setFieldErrors({});

      try {
        const existing = await recoveryService.getDailyMetricsForDate(
          user.id,
          dateToLoad
        );

        if (existing) {
          setExistingEntryId(existing.id);
          const { hours, minutes } = decimalToHoursAndMinutes(existing.sleep_hours);
          const hStr = String(hours);
          const mStr = minutes > 0 ? String(minutes) : "0";
          const scoreStr = existing.sleep_score !== null ? String(existing.sleep_score) : "";
          const hrvStr = String(existing.hrv);
          const rhrStr = String(existing.resting_hr);
          const loadVal = existing.activity_load;
          const notesStr = existing.notes || "";

          setSleepHours(hStr);
          setSleepMinutes(mStr);
          setSleepScore(scoreStr);
          setHrv(hrvStr);
          setRestingHr(rhrStr);
          setActivityLoad(loadVal);
          setNotes(notesStr);

          initialSnapshotRef.current = {
            sleepHours: hStr,
            sleepMinutes: mStr,
            sleepScore: scoreStr,
            hrv: hrvStr,
            restingHr: rhrStr,
            activityLoad: loadVal,
            notes: notesStr,
          };
        } else {
          setExistingEntryId(null);
          const target = profile?.sleep_target_hours || 8;
          const { hours, minutes } = decimalToHoursAndMinutes(target);
          const hStr = String(hours);
          const mStr = minutes > 0 ? String(minutes) : "0";

          setSleepHours(hStr);
          setSleepMinutes(mStr);
          setSleepScore("");
          setHrv("");
          setRestingHr("");
          setActivityLoad("moderate");
          setNotes("");

          initialSnapshotRef.current = {
            sleepHours: hStr,
            sleepMinutes: mStr,
            sleepScore: "",
            hrv: "",
            restingHr: "",
            activityLoad: "moderate",
            notes: "",
          };
        }
      } catch (err) {
        setGeneralError("Could not check existing records. Please try again.");
      } finally {
        setIsLoadingInitial(false);
      }
    },
    [user?.id, profile?.sleep_target_hours]
  );

  useEffect(() => {
    loadExistingMetrics(selectedDate);
  }, [selectedDate, loadExistingMetrics]);

  // Calculated sleep duration helper
  const calculatedSleep = (): string | null => {
    const h = parseInt(sleepHours, 10) || 0;
    const m = parseInt(sleepMinutes, 10) || 0;
    if (h === 0 && m === 0) return null;
    const total = hoursAndMinutesToDecimal(h, m);
    return `${h}h ${m}m (${total} hrs)`;
  };

  // Quick date switches
  const handleSelectDate = (dateStr: string) => {
    if (dateStr !== selectedDate && isValidDateString(dateStr)) {
      setSelectedDate(dateStr);
    }
    setShowDatePickerModal(false);
  };

  // Generate past 30 days for selection
  const pastDatesList: PastDateOption[] = (() => {
    const list: PastDateOption[] = [];
    const base = new Date();
    for (let i = 0; i <= 30; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      const dateStr = getTodayDateString(d);
      let label = formatDisplayDate(dateStr, { includeWeekday: true, includeYear: false });
      let subLabel = "";
      if (i === 0) subLabel = "Today";
      else if (i === 1) subLabel = "Yesterday";
      else subLabel = `${i} days ago`;
      list.push({ dateStr, label, subLabel });
    }
    return list;
  })();

  const yesterdayDateStr = (() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return getTodayDateString(y);
  })();

  const isCustomDate = selectedDate !== todayDate && selectedDate !== yesterdayDateStr;

  // Clear individual field error helpers
  const clearFieldError = (field: keyof DailyMetricsValidationErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!user?.id) {
      setGeneralError("You must be logged in to save recovery data.");
      return;
    }

    setGeneralError(null);
    setFieldErrors({});

    const validation = validateDailyMetricsInput(
      {
        date: selectedDate,
        sleepHours,
        sleepMinutes,
        sleepScore: sleepScore.trim() === "" ? null : sleepScore,
        hrv,
        restingHr,
        activityLoad,
        notes,
      },
      todayDate
    );

    if (!validation.isValid || !validation.sanitizedData) {
      setFieldErrors(validation.errors);
      if (validation.errors.date) {
        setGeneralError(validation.errors.date);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        user_id: user.id,
        date: validation.sanitizedData.date,
        sleep_hours: validation.sanitizedData.sleep_hours,
        sleep_score: validation.sanitizedData.sleep_score,
        hrv: validation.sanitizedData.hrv,
        resting_hr: validation.sanitizedData.resting_hr,
        activity_load: validation.sanitizedData.activity_load,
        notes: validation.sanitizedData.notes,
        ...(existingEntryId ? { id: existingEntryId } : {}),
      };

      const result = await recoveryService.saveDailyMetrics(payload);

      if (result.error) {
        setGeneralError(formatDailyMetricsError(result.error));
      } else {
        setSaveSuccess(true);
        setTimeout(() => {
          router.back();
        }, 600);
      }
    } catch (err) {
      setGeneralError(formatDailyMetricsError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const performDelete = async () => {
    if (!user?.id) return;
    setIsDeleting(true);
    setGeneralError(null);

    try {
      let result;
      if (existingEntryId) {
        result = await recoveryService.deleteDailyMetric(existingEntryId);
      } else {
        result = await recoveryService.deleteDailyMetricByDate(
          user.id,
          selectedDate
        );
      }

      if (result.error) {
        setGeneralError(formatDailyMetricsError(result.error));
      } else {
        router.back();
      }
    } catch (err) {
      setGeneralError(formatDailyMetricsError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = () => {
    if (!existingEntryId && !selectedDate) return;
    Alert.alert(
      "Delete Check-In",
      `Are you sure you want to delete your recovery entry for ${formatDisplayDate(
        selectedDate
      )}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Entry",
          style: "destructive",
          onPress: performDelete,
        },
      ]
    );
  };

  // True if any value was modified compared to the initial loaded state
  const isDirty = Boolean(
    initialSnapshotRef.current && (
      sleepHours !== initialSnapshotRef.current.sleepHours ||
      sleepMinutes !== initialSnapshotRef.current.sleepMinutes ||
      sleepScore !== initialSnapshotRef.current.sleepScore ||
      hrv !== initialSnapshotRef.current.hrv ||
      restingHr !== initialSnapshotRef.current.restingHr ||
      activityLoad !== initialSnapshotRef.current.activityLoad ||
      notes.trim() !== initialSnapshotRef.current.notes.trim()
    )
  );

  return {
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
    setSleepHours: (val: string) => setSleepHours(val.replace(",", ".")),
    sleepMinutes,
    setSleepMinutes,
    sleepScore,
    setSleepScore: (val: string) => setSleepScore(val.replace(",", ".")),
    hrv,
    setHrv: (val: string) => setHrv(val.replace(",", ".")),
    restingHr,
    setRestingHr: (val: string) => setRestingHr(val.replace(",", ".")),
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
  };
}
