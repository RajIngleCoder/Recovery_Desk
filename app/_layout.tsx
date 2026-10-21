import { DemoProvider } from "@/features/demo/DemoContext";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { LoadingState } from "@/components/ui/LoadingState";
import { colors } from "@/constants";

import { getRouteRedirect } from "@/features/auth/routeGuard";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { session, profile, isLoading, isProfileLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const currentSegment = segments[0] || "";
    const redirectTarget = getRouteRedirect({
      isLoading,
      hasSession: Boolean(session),
      isProfileLoaded: !session || isProfileLoaded,
      onboardingCompleted: Boolean(profile?.onboarding_completed),
      currentSegment,
    });

    if (redirectTarget) {
      router.replace(redirectTarget as any);
    }
  }, [session, profile, isLoading, isProfileLoaded, segments, router]);

  if (isLoading) {
    return (
      <LoadingState
        message="Loading Recovery Desk..."
        style={{ backgroundColor: colors.background }}
      />
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DemoProvider>
        <StatusBar style="light" />
        <RouteGuard>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: "fade",
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
        </RouteGuard>
      </DemoProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
