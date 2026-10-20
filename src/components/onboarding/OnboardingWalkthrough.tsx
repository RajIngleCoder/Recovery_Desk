import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Card, AppButton, BrandLogo } from "@/components/ui";
import { colors, radius, spacing, typography } from "@/constants";
import {
  DecisionSwitcherVisual,
  SignalsGridVisual,
  BaselineComparisonVisual,
  TodaysPlanVisual,
  TransparencyBreakdownVisual,
} from "./WalkthroughVisuals";

export interface OnboardingWalkthroughProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface SlideItem {
  id: number;
  badge: string;
  headline: string;
  subhead: string;
  renderVisual: () => React.ReactNode;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    badge: "DAILY CLARITY",
    headline: "Know when to push. Know when to recover.",
    subhead: "Your body doesn't need another complex graph. It needs a clear decision.",
    renderVisual: () => <DecisionSwitcherVisual />,
  },
  {
    id: 2,
    badge: "INPUTS THAT MATTER",
    headline: "Four body signals. Zero noise.",
    subhead: "We focus on the markers that actually reflect your physiological readiness.",
    renderVisual: () => <SignalsGridVisual />,
  },
  {
    id: 3,
    badge: "CALIBRATED TO YOU",
    headline: "Your normal matters more than anyone else's.",
    subhead: "We never grade you against a generic athlete. Recovery Desk learns your 14-day rolling baseline.",
    renderVisual: () => <BaselineComparisonVisual />,
  },
  {
    id: 4,
    badge: "TODAY'S PLAN",
    headline: "A concrete training plan every morning.",
    subhead: "Actionable intensity guidance for Training, Movement, and Sleep.",
    renderVisual: () => <TodaysPlanVisual />,
  },
  {
    id: 5,
    badge: "TRANSPARENCY",
    headline: "No mystery scores. Always know why.",
    subhead: "Complete point contributions show you exactly how your recovery score was calculated.",
    renderVisual: () => <TransparencyBreakdownVisual />,
  },
];

export function OnboardingWalkthrough({
  onComplete,
  onSkip,
}: OnboardingWalkthroughProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;
  // Slide width matches content width inside screen
  const slideWidth = screenWidth - spacing.base * 2;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / slideWidth);
    if (index >= 0 && index < SLIDES.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
    } else {
      onComplete();
    }
  };

  const currentSlide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Top Header Row with Logo and Skip Button */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <BrandLogo size={28} />
          <Text style={styles.brandName}>Recovery Desk</Text>
        </View>

        {onSkip && (
          <TouchableOpacity
            onPress={onSkip}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip product walkthrough"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slide Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        decelerationRate="fast"
        snapToInterval={slideWidth}
        snapToAlignment="center"
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slideCard, { width: slideWidth }]}>
            <Card style={styles.slideInnerCard}>
              <View style={styles.slideHeader}>
                <View style={styles.slideBadge}>
                  <Text style={styles.slideBadgeText}>{slide.badge}</Text>
                </View>
                <Text style={styles.slideHeadline}>{slide.headline}</Text>
                <Text style={styles.slideSubhead}>{slide.subhead}</Text>
              </View>

              <View style={styles.visualContainer}>
                {slide.renderVisual()}
              </View>
            </Card>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation & Indicator */}
      <View style={styles.bottomControls}>
        <View style={styles.indicatorRow}>
          {SLIDES.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <View
                key={i}
                style={[
                  styles.dot,
                  isActive && styles.activePill,
                ]}
              />
            );
          })}
        </View>

        <AppButton
          title={isLast ? "Calibrate My Baseline →" : "Next"}
          onPress={handleNext}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  brandName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
  },
  skipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  carousel: {
    flexGrow: 0,
  },
  carouselContent: {
    alignItems: "center",
  },
  slideCard: {
    paddingVertical: spacing.xs,
  },
  slideInnerCard: {
    padding: spacing.base,
  },
  slideHeader: {
    marginBottom: spacing.sm,
  },
  slideBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  slideBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  slideHeadline: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
    marginBottom: spacing.xxs,
  },
  slideSubhead: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
  },
  visualContainer: {
    marginTop: spacing.xs,
  },
  bottomControls: {
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  indicatorRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  activePill: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  actionButton: {
    width: "100%",
  },
});
