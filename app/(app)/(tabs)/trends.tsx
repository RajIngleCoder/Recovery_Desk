import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Screen, Card, EmptyState, ErrorState, LoadingState } from "@/components/ui";
import { TrendMetricCard, TrendStatusDistribution } from "@/components/trends";
import { BaselineLearningBanner } from "@/components/recovery";
import { colors, spacing, typography, radius } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/features/demo/DemoContext";
import { generateDemoMetrics } from "@/features/demo/demoData";
import { recoveryService } from "@/services/recoveryService";
import { calculateTrends, TrendsResult } from "@/domain/recovery/trends";
import { getTodayDateString } from "@/lib/date";

export default function TrendsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDemoMode, demoScenario } = useDemoMode();

  const [trends, setTrends] = useState<TrendsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayDate = getTodayDateString();

  const loadTrends = useCallback(async (isRefresh = false) => {
    if (isDemoMode) {
      setIsLoading(false);
      setIsRefreshing(false);
      setError(null);
      const { metrics, recommendations } = generateDemoMetrics(todayDate, demoScenario || "moderate");
      const result = calculateTrends(metrics, recommendations, todayDate, 7);
      setTrends(result);
      return;
    }

    if (!user) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // 1. Fetch recent daily metrics (past 30 days for rolling baseline context)
      const metrics = await recoveryService.getRecentMetrics(user.id, 30);

      // 2. Fetch recent recommendations (past 30 days)
      const recommendations = await recoveryService.getRecentRecommendations(user.id, 30);

      // 3. Compute 7-day trends and rolling 14-day baselines
      const result = calculateTrends(metrics, recommendations, todayDate, 7);
      setTrends(result);
    } catch (err) {
      console.warn("[TrendsScreen] Error loading trends:", err);
      setError("Unable to compute recovery trends. Please check your connection.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, todayDate, isDemoMode, demoScenario]);

  React.useEffect(() => {
    loadTrends();
  }, [isDemoMode, demoScenario, loadTrends]);

  useFocusEffect(
    useCallback(() => {
      loadTrends();
    }, [loadTrends])
  );

  if (isLoading && !isRefreshing) {
    return (
      <Screen>
        <LoadingState message="Calculating trend metrics & baselines..." />
      </Screen>
    );
  }

  if (error && (!trends || trends.entryCount === 0)) {
    return (
      <Screen>
        <ErrorState
          title="Trends Unavailable"
          message={error}
          onRetry={() => loadTrends()}
        />
      </Screen>
    );
  }

  const isEmpty = !trends || trends.entryCount === 0;
  const isLearning = trends?.baselineStatus === "learning";

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadTrends(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Understand Your Recovery Patterns</Text>
          <Text style={styles.subtitle}>
            See how your daily recovery signals are moving against your personal baseline
          </Text>
        </View>

        {/* Empty State */}
        {isEmpty ? (
          <Card style={styles.emptyCard}>
            <EmptyState
              title="No recovery data yet"
              description="Log at least 3 days of recovery check-ins to establish your baseline and track 7-day recovery trends."
              actionLabel="Log today's metrics"
              onAction={() => router.push("/(app)/check-in")}
            />
          </Card>
        ) : (
          <View style={styles.trendsContent}>
            {/* Learning Notice if history < 3 entries */}
            {isLearning && (
              <BaselineLearningBanner
                dataCount={trends.entryCount}
                minRequired={3}
              />
            )}

            {/* Recovery Decision Distribution Summary */}
            <TrendStatusDistribution distribution={trends.statusDistribution} />

            {/* Personal Baseline Philosophy Callout */}
            <Card style={styles.baselinePhilosophyCard}>
              <View style={styles.philosophyHeader}>
                <Ionicons name="finger-print-outline" size={16} color={colors.primary} />
                <Text style={styles.philosophyTitle}>YOUR PERSONAL 14-DAY BASELINE</Text>
              </View>
              <Text style={styles.philosophyBody}>
                Your normal matters more than someone else's normal. Recovery Desk compares your daily signals exclusively against your own rolling history — never against an arbitrary population average.
              </Text>
            </Card>

            {/* 1. HRV Trend Card */}
            <TrendMetricCard
              summary={trends.hrv}
              icon="💓"
              accentColor={colors.primary}
            />

            {/* 2. Resting Heart Rate Trend Card */}
            <TrendMetricCard
              summary={trends.restingHr}
              icon="❤️"
              accentColor={colors.moderate}
            />

            {/* 3. Sleep Duration Trend Card */}
            <TrendMetricCard
              summary={trends.sleep}
              icon="🌙"
              accentColor={colors.push}
            />

            {/* Non-diagnostic Medical Disclaimer Card */}
            <Card style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <Text style={styles.disclaimerIcon}>ℹ️</Text>
                <Text style={styles.disclaimerTitle}>WELLNESS TRACKING NOTICE</Text>
              </View>
              <Text style={styles.disclaimerText}>
                Trends and rolling baselines reflect personal historical variations computed
                algorithmically for training pacing and lifestyle reflection. They do not constitute
                clinical health metrics or medical diagnostic assessments.
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
    paddingBottom: spacing.xxl,
  },
  header: {
    marginVertical: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  emptyCard: {
    padding: spacing.md,
  },
  trendsContent: {
    gap: spacing.xs,
  },
  baselinePhilosophyCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: spacing.xs,
  },
  philosophyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.xxs,
  },
  philosophyTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  philosophyBody: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  disclaimerCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  disclaimerIcon: {
    fontSize: 14,
  },
  disclaimerTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
