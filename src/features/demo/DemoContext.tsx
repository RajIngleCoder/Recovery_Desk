import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEMO_MODE_STORAGE_KEY = "@recovery_desk:demo_mode";
const DEMO_SCENARIO_STORAGE_KEY = "@recovery_desk:demo_scenario";

export type DemoScenario = "push" | "moderate" | "recover";

export interface DemoMetricSet {
  metric: {
    hrv: number;
    resting_hr: number;
    sleep_hours: number;
    activity_load: "low" | "moderate" | "high";
    notes: string;
  };
  baseline: {
    hrvBaseline: number;
    restingHrBaseline: number;
    sleepBaseline: number;
    status: "established";
  };
}

export const DEMO_SCENARIOS: Record<DemoScenario, DemoMetricSet> = {
  push: {
    metric: {
      hrv: 74,
      resting_hr: 48,
      sleep_hours: 8.5,
      activity_load: "low",
      notes: "Felt well-rested, early wind-down.",
    },
    baseline: {
      hrvBaseline: 65,
      restingHrBaseline: 52,
      sleepBaseline: 8.0,
      status: "established",
    },
  },
  moderate: {
    metric: {
      hrv: 62,
      resting_hr: 53,
      sleep_hours: 7.5,
      activity_load: "moderate",
      notes: "Normal day, mild physical fatigue.",
    },
    baseline: {
      hrvBaseline: 65,
      restingHrBaseline: 52,
      sleepBaseline: 8.0,
      status: "established",
    },
  },
  recover: {
    metric: {
      hrv: 48,
      resting_hr: 62,
      sleep_hours: 5.5,
      activity_load: "high",
      notes: "Late night and demanding prior day strain.",
    },
    baseline: {
      hrvBaseline: 65,
      restingHrBaseline: 52,
      sleepBaseline: 8.0,
      status: "established",
    },
  },
};

export interface DemoProfile {
  displayName: string;
  email: string;
  goal: string;
  sleepTarget: string;
}

export const DEMO_PROFILE: DemoProfile = {
  displayName: "Alex Morgan",
  email: "alex@example.com",
  goal: "Training & Performance",
  sleepTarget: "8.0h",
};

interface DemoContextValue {
  isDemoMode: boolean;
  toggleDemoMode: (val?: boolean) => Promise<void>;
  demoProfile: DemoProfile;
  demoScenario: DemoScenario;
  setDemoScenario: (scenario: DemoScenario) => Promise<void>;
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoScenario, setDemoScenarioState] = useState<DemoScenario>("moderate");

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(DEMO_MODE_STORAGE_KEY),
      AsyncStorage.getItem(DEMO_SCENARIO_STORAGE_KEY),
    ])
      .then(([modeVal, scenarioVal]) => {
        if (modeVal === "true") {
          setIsDemoMode(true);
        }
        if (scenarioVal === "push" || scenarioVal === "moderate" || scenarioVal === "recover") {
          setDemoScenarioState(scenarioVal);
        }
      })
      .catch((err) => {
        console.warn("[DemoContext] Failed to load demo mode preference:", err);
      });
  }, []);

  const toggleDemoMode = async (override?: boolean) => {
    const nextVal = override !== undefined ? override : !isDemoMode;
    setIsDemoMode(nextVal);
    try {
      await AsyncStorage.setItem(DEMO_MODE_STORAGE_KEY, nextVal ? "true" : "false");
    } catch (err) {
      console.warn("[DemoContext] Failed to save demo mode preference:", err);
    }
  };

  const setDemoScenario = async (scenario: DemoScenario) => {
    setDemoScenarioState(scenario);
    try {
      await AsyncStorage.setItem(DEMO_SCENARIO_STORAGE_KEY, scenario);
    } catch (err) {
      console.warn("[DemoContext] Failed to save demo scenario preference:", err);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode: Boolean(__DEV__ && isDemoMode),
        toggleDemoMode,
        demoProfile: DEMO_PROFILE,
        demoScenario,
        setDemoScenario,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoMode(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemoMode must be used within a DemoProvider");
  }
  return ctx;
}
