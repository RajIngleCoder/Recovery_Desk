import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Card, EmptyState, ErrorState, LoadingState, BrandLogo } from "@/components/ui";
import {
  RecoveryStatusCard,
  RecoveryFactors,
  BaselineLearningBanner,
} from "@/components/recovery";
import { colors, spacing, typography } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/features/demo/DemoContext";
import { generateDemoMetrics } from "@/features/demo/demoData";
import { recoveryService } from "@/services/recoveryService";
import { calculateBaseline } from "@/domain/recovery/baseline";
import { calculateRecoveryDecision } from "@/domain/recovery/scoring";
import { getTodayDateString, formatDisplayDate } from "@/lib/date";
import {
  BaselineCalculationResult,
  RecoveryDecision,
} from "@/domain/recovery/types";
import { DailyMetricRow, Json } from "@/types/database";

export default function TodayScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { isDemoMode, demoProfile, demoScenario } = useDemoMode();
  const todayDate = getTodayDateString();

  const displayName = isDemoMode ? demoProfile.displayName : (profile?.display_name || "there");
  const formattedToday = formatDisplayDate(todayDate, {
    includeWeekday: true,
    includeYear: false,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [todayMetric, setTodayMetric] = useState<DailyMetricRow | null>(null);
  const [baselineData, setBaselineData] = useState<BaselineCalculationResult | null>(null);
  const [recentMetrics, setRecentMetrics] = useState<DailyMetricRow[]>([]);
  const [decision, setDecision] = useState<RecoveryDecision | null>(null);

  // Fetch today's metrics and historical baseline
  const loadHomeData = useCallback(async () => {
    setError(null);

    // 0. Handle Marketing Demo Mode (immediate mock data generation)
    if (isDemoMode) {
      setIsLoading(false);
      setIsRefreshing(false);

      const { metrics, todayMetric: mockToday } = generateDemoMetrics(
        todayDate,
        demoScenario || "moderate"
      );

      const priorEntries = metrics.filter((m) => m.date !== todayDate);
      const baseline = calculateBaseline(priorEntries, {
        referenceDate: todayDate,
        windowDays: 14,
      });

      setTodayMetric(mockToday);
      setBaselineData(baseline);
      setRecentMetrics(metrics);

      const userGoal = "training";
      const calculated = calculateRecoveryDecision({
        hrv: mockToday.hrv,
        restingHr: mockToday.resting_hr,
        sleepHours: mockToday.sleep_hours,
        activityLoad: mockToday.activity_load,
        hrvBaseline: baseline.hrvBaseline ?? undefined,
        restingHrBaseline: baseline.restingHrBaseline ?? undefined,
        sleepBaseline: baseline.sleepBaseline ?? undefined,
        goal: userGoal,
      });

      setDecision(calculated);
      return;
    }

    if (!user?.id) return;

    try {
      // 1. Fetch today's metric entry
      const today = await recoveryService.getDailyMetricsForDate(user.id, todayDate);
      setTodayMetric(today);

      // 2. Fetch last 14 days of history to compute rolling baseline
      const history = await recoveryService.getRecentMetrics(user.id, 14);

      // Filter historical entries strictly prior to today for baseline calculation
      const allRecent = today ? [today, ...history.filter((m) => m.date !== todayDate)] : history;
      setRecentMetrics(allRecent);
      const priorEntries = history.filter((m) => m.date !== todayDate);
      const baseline = calculateBaseline(priorEntries, {
        referenceDate: todayDate,
        windowDays: 14,
      });
      setBaselineData(baseline);

      // 3. If today's metrics exist, compute recovery decision
      if (today) {
        const userGoal = (profile?.goal || "general") as any;
        const calculated = calculateRecoveryDecision({
          hrv: today.hrv,
          restingHr: today.resting_hr,
          sleepHours: today.sleep_hours,
          activityLoad: today.activity_load,
          hrvBaseline: baseline.hrvBaseline ?? undefined,
          restingHrBaseline: baseline.restingHrBaseline ?? undefined,
          sleepBaseline: baseline.sleepBaseline ?? undefined,
          goal: userGoal,
        });

        setDecision(calculated);

        // 4. Save/sync today's recommendation to database
        recoveryService.saveRecommendation({
          user_id: user.id,
          date: todayDate,
          status: calculated.status,
          score: calculated.score,
          reason_data: {
            title: calculated.title,
            body: calculated.body,
            action: calculated.action,
            reason: calculated.reason,
            baselineStatus: calculated.baselineStatus,
            factors: calculated.factors,
          } as unknown as Json,
        }).catch((err) => {
          console.warn("[TodayScreen] Failed to persist recommendation:", err);
        });
      } else {
        setDecision(null);
      }
    } catch (err) {
      console.warn("[TodayScreen] Error loading home recovery data:", err);
      setError("Unable to load recovery data. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, todayDate, isDemoMode, demoScenario, profile?.goal]);

  useEffect(() => {
    loadHomeData();
  }, [isDemoMode, demoScenario, loadHomeData]);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadHomeData();
  };

  const handleWhyPress = () => {
    if (!todayMetric) return;

    router.push({
      pathname: "/(app)/recommendation-details",
      params: {
        status: decision?.status,
        score: String(decision?.score),
        hrv: String(todayMetric.hrv),
        hrvBaseline: baselineData?.hrvBaseline ? String(baselineData.hrvBaseline) : undefined,
        restingHr: String(todayMetric.resting_hr),
        restingHrBaseline: baselineData?.restingHrBaseline ? String(baselineData.restingHrBaseline) : undefined,
        sleepHours: String(todayMetric.sleep_hours),
        sleepBaseline: baselineData?.sleepBaseline ? String(baselineData.sleepBaseline) : undefined,
        activityLoad: todayMetric.activity_load,
      },
    });
  };

  const handleEditPress = () => {
    router.push({
      pathname: "/(app)/check-in",
      params: { date: todayDate },
    });
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Brand Bar */}
        <View style={styles.brandBar}>
          <View style={styles.brandLogoRow}>
            <BrandLogo size={24} />
            <Text style={styles.brandWordmark}>Recovery Desk</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(app)/check-in")}
            style={styles.quickAddButton}
            accessibilityRole="button"
            accessibilityLabel="Log check-in"
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.quickAddText}>Log Check-in</Text>
          </TouchableOpacity>
        </View>

        {/* Header Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {displayName}
          </Text>
          <Text style={styles.dateText}>{formattedToday}</Text>
        </View>

        {/* Loading State */}
        {isLoading && !isRefreshing ? (
          <LoadingState message="Loading today's recovery..." style={styles.loadingContainer} />
        ) : error ? (
          /* Error State with Retry */
          <Card style={styles.errorCard}>
            <ErrorState
              title="Couldn't load recovery data"
              message={error}
              onRetry={loadHomeData}
              retryLabel="Try again"
            />
          </Card>
        ) : !todayMetric || !decision ? (
          /* Empty State when no check-in for today exists */
          <Card style={styles.emptyCard}>
            <EmptyState
              title="Today's recovery isn't ready yet"
              description="Log your sleep duration, HRV, and resting heart rate to receive today's personalized recovery decision."
              actionLabel="Add today's data"
              onAction={() => router.push("/(app)/check-in")}
            />
          </Card>
        ) : (
          /* Populated Recovery Experience */
          <View>
            {/* Baseline Learning Banner (shown when history < 3 days) */}
            {baselineData?.status === "learning" && (
              <BaselineLearningBanner dataCount={baselineData.dataCount} minRequired={3} />
            )}

            {/* Main Decision Status Card */}
            <RecoveryStatusCard
              decision={decision}
              onWhyPress={handleWhyPress}
              onEditPress={handleEditPress}
            />

            {/* Contributing Biomarkers Breakdown */}
            <RecoveryFactors factors={decision.factors} recentMetrics={recentMetrics} />

            
            {/* Closed-Loop System & Tomorrow Hook Card */}
            <Card variant="muted" style={styles.tomorrowCard}>
              <View style={styles.tomorrowHeader}>
                <Ionicons name="moon-outline" size={15} color={colors.primary} />
                <Text style={styles.tomorrowTitle}>TOMORROW'S RECOVERY</Text>
              </View>
              <Text style={styles.tomorrowBody}>
                Today's recommendation guides your physical strain. Log tonight's sleep to calculate your next recovery window.
              </Text>
            </Card>

            {/* Non-Diagnostic Product Philosophy Card */}
            <Card variant="muted" style={styles.infoCard}>
              <Text style={styles.infoTitle}>HOW RECOVERY DESK DECIDES</Text>
              <Text style={styles.infoBody}>
                Recovery Desk compares today's recovery signals with your personal 14-day rolling
                baseline to determine your daily recommendation. It does not diagnose or treat medical
                conditions.
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  brandBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  logoCircle: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWordmark: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  quickAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
  },
  quickAddText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  header: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    fontWeight: typography.weights.medium,
  },
  loadingContainer: {
    minHeight: 280,
  },
  errorCard: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  emptyCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  
  tomorrowCard: {
    padding: spacing.base,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  tomorrowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.xxs,
  },
  tomorrowTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  tomorrowBody: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
    fontWeight: typography.weights.medium,
  },

  infoCard: {
    padding: spacing.base,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
    letterSpacing: 0.6,
  },
  infoBody: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
