export interface RouteGuardState {
  isLoading: boolean;
  hasSession: boolean;
  isProfileLoaded?: boolean;
  onboardingCompleted: boolean;
  currentSegment: string; // e.g. "(auth)", "(onboarding)", "(app)", or empty
}

/**
 * Pure function to determine target route redirection.
 * Returns the route string to redirect to, or null if no redirection is needed.
 */
export function getRouteRedirect(state: RouteGuardState): string | null {
  if (state.isLoading) {
    return null;
  }

  const inAuthGroup = state.currentSegment === "(auth)";
  const inOnboardingGroup = state.currentSegment === "(onboarding)";

  if (!state.hasSession) {
    if (!inAuthGroup) {
      return "/(auth)/sign-in";
    }
    return null;
  }

  // User has an active session
  // If profile is not yet loaded (e.g. offline/network delay), do not prematurely redirect to onboarding
  if (state.isProfileLoaded === false) {
    return null;
  }

  if (!state.onboardingCompleted) {
    if (!inOnboardingGroup) {
      return "/(onboarding)/welcome";
    }
    return null;
  }

  // User has session and completed onboarding
  if (inAuthGroup || inOnboardingGroup) {
    return "/(app)/(tabs)";
  }

  return null;
}
