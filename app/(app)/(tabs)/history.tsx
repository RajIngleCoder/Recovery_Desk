import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Screen, Card, LoadingState, ErrorState, EmptyState, ConfirmModal } from "@/components/ui";
import { colors, spacing } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/features/demo/DemoContext";
import { generateDemoMetrics } from "@/features/demo/demoData";
import { recoveryService } from "@/services/recoveryService";
import { getTodayDateString, formatDisplayDate } from "@/lib/date";
import { DailyMetricRow, RecommendationRow } from "@/types/database";
import { HistoryEntryCard } from "@/components/history";

export interface HistoryEntryItem {
  metric: DailyMetricRow;
  recommendation: RecommendationRow | null;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDemoMode, demoScenario } = useDemoMode();
  const todayDate = getTodayDateString();
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<HistoryEntryItem[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadHistory = useCallback(
    async (isRefresh = false) => {
      if (isDemoMode) {
        setIsLoading(false);
        setIsRefreshing(false);
        setError(null);
        const { metrics, recommendations } = generateDemoMetrics(
          todayDate,
          demoScenario || "moderate"
        );
        const recMap = new Map<string, RecommendationRow>();
        for (const rec of recommendations) {
          recMap.set(rec.date, rec);
        }
        const combined: HistoryEntryItem[] = metrics.map((m) => ({
          metric: m,
          recommendation: recMap.get(m.date) || null,
        }));
        setEntries(combined);
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
        const metrics = await recoveryService.getRecentMetrics(user.id, 30);
        const recommendations = await recoveryService.getRecentRecommendations(
          user.id,
          30
        );

        const recMap = new Map<string, RecommendationRow>();
        for (const rec of recommendations) {
          recMap.set(rec.date, rec);
        }

        const combined: HistoryEntryItem[] = metrics.map((m) => ({
          metric: m,
          recommendation: recMap.get(m.date) || null,
        }));

        setEntries(combined);
      } catch (err) {
        console.warn("[HistoryScreen] Error loading history:", err);
        setError(
          "Unable to load your recovery history. Please check your connection."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user, isDemoMode, demoScenario, todayDate]
  );

  useEffect(() => {
    loadHistory();
  }, [isDemoMode, demoScenario, loadHistory]);

  const handleDelete = (date: string) => {
    setDateToDelete(date);
  };

  const handleConfirmDelete = async () => {
    if (!user || !dateToDelete) return;
    const date = dateToDelete;
    setIsDeleting(date);
    try {
      await recoveryService.deleteDailyMetricByDate(user.id, date);
      setEntries((prev) => prev.filter((e) => e.metric.date !== date));
      if (expandedDate === date) setExpandedDate(null);
    } catch (err) {
      console.warn("[HistoryScreen] Delete error:", err);
      setError("Failed to delete the recovery entry. Please try again.");
    } finally {
      setIsDeleting(null);
      setDateToDelete(null);
    }
  };

  const toggleExpand = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  if (isLoading && !isRefreshing) {
    return (
      <Screen>
        <LoadingState message="Loading your recovery history..." />
      </Screen>
    );
  }

  if (error && entries.length === 0) {
    return (
      <Screen>
        <ErrorState
          title="History Unavailable"
          message={error}
          onRetry={() => loadHistory()}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadHistory(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Your past recovery logs and daily decisions</Text>
        </View>

        {entries.length === 0 ? (
          <Card style={styles.emptyCard}>
            <EmptyState
              title="No recovery history yet"
              description="Your daily logged recovery metrics and status decisions will appear here chronologically."
              actionLabel="Log today's metrics"
              onAction={() => router.push("/(app)/check-in")}
            />
          </Card>
        ) : (
          <View style={styles.listContainer}>
            {entries.map(({ metric, recommendation }) => (
              <HistoryEntryCard
                key={metric.date}
                metric={metric}
                recommendation={recommendation}
                isToday={metric.date === todayDate}
                isExpanded={expandedDate === metric.date}
                isDeleting={isDeleting === metric.date}
                onToggleExpand={() => toggleExpand(metric.date)}
                onDelete={() => handleDelete(metric.date)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={Boolean(dateToDelete)}
        title="Delete Entry"
        message={
          dateToDelete
            ? `Are you sure you want to remove your recovery log for ${formatDisplayDate(dateToDelete)}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Entry"
        cancelText="Cancel"
        confirmVariant="danger"
        iconName="trash-outline"
        loading={Boolean(isDeleting)}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDateToDelete(null)}
      />
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
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  listContainer: {
    gap: spacing.md,
  },
});
