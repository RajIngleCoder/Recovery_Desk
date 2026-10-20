import { getRouteRedirect } from "../routeGuard";

describe("Route Guard Protection Rules", () => {
  it("returns null while auth state is loading", () => {
    const redirect = getRouteRedirect({
      isLoading: true,
      hasSession: false,
      onboardingCompleted: false,
      currentSegment: "(app)",
    });
    expect(redirect).toBeNull();
  });

  describe("Logged-out state (hasSession: false)", () => {
    it("redirects to / (auth)/sign-in when user attempts to access (app)", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: false,
        onboardingCompleted: false,
        currentSegment: "(app)",
      });
      expect(redirect).toBe("/(auth)/sign-in");
    });

    it("redirects to /(auth)/sign-in when user attempts to access (onboarding)", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: false,
        onboardingCompleted: false,
        currentSegment: "(onboarding)",
      });
      expect(redirect).toBe("/(auth)/sign-in");
    });

    it("allows user to stay in (auth) screens without redirect", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: false,
        onboardingCompleted: false,
        currentSegment: "(auth)",
      });
      expect(redirect).toBeNull();
    });
  });

  describe("Logged-in with incomplete onboarding", () => {
    it("redirects to /(onboarding)/welcome when currently in (auth)", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: true,
        onboardingCompleted: false,
        currentSegment: "(auth)",
      });
      expect(redirect).toBe("/(onboarding)/welcome");
    });

    it("redirects to /(onboarding)/welcome when user attempts to jump to (app)", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: true,
        onboardingCompleted: false,
        currentSegment: "(app)",
      });
      expect(redirect).toBe("/(onboarding)/welcome");
    });

    it("allows user to stay in (onboarding) without redirect", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: true,
        onboardingCompleted: false,
        currentSegment: "(onboarding)",
      });
      expect(redirect).toBeNull();
    });
  });

  describe("Logged-in with completed onboarding", () => {
    it("redirects to /(app)/(tabs) when user is in (auth)", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: true,
        onboardingCompleted: true,
        currentSegment: "(auth)",
      });
      expect(redirect).toBe("/(app)/(tabs)");
    });

    it("redirects to /(app)/(tabs) when user is in (onboarding)", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: true,
        onboardingCompleted: true,
        currentSegment: "(onboarding)",
      });
      expect(redirect).toBe("/(app)/(tabs)");
    });

    it("allows user to stay in (app) without redirect", () => {
      const redirect = getRouteRedirect({
        isLoading: false,
        hasSession: true,
        onboardingCompleted: true,
        currentSegment: "(app)",
      });
      expect(redirect).toBeNull();
    });
  });
});
