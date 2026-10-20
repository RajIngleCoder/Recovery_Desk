export const colors = {
  // Base background & surfaces (First-light dawn palette)
  background: "#FAF7F2",       // Warm Dawn Ivory
  surface: "#FFFFFF",          // Crisp White Cards
  surfaceElevated: "#FFFFFF",  // Crisp White with elevation shadow
  surfaceMuted: "#F0EAE0",     // Warm Sand / Secondary Surface

  // Borders & Dividers
  border: "#E6DFD3",           // 1px Hairline Dawn Border
  borderSubtle: "#F0EAE0",     // Muted Border
  borderActive: "#1F2933",     // Charcoal Focus Border

  // Typography
  textPrimary: "#1F2933",      // Deep Charcoal / Slate
  textSecondary: "#6E7681",    // Editorial Steel Grey
  textMuted: "#8C959F",        // Subdued Steel
  textInverse: "#FFFFFF",      // White on Dark/Accent

  // Brand / Accent (Sunrise Ember)
  primary: "#D9480F",          // First-Light Sunrise Ember
  primaryHover: "#BC3E0C",     // Deep Terracotta
  primaryLight: "rgba(217, 72, 15, 0.08)", // Subtle Ember tint
  accent: "#D9480F",
  accentHover: "#BC3E0C",

  // Status Colors (Disciplined, editorial, non-neon)
  push: "#2B8A3E",             // Forest / Olive Green (Optimal)
  pushBackground: "#EBFBEE",
  pushLight: "#EBFBEE",   // Soft Sage Tint
  pushBorder: "#B2F2BB",

  moderate: "#D97706",         // Warm Amber (Maintain / Caution)
  moderateBackground: "#FFFBEB",
  moderateLight: "#FFFBEB", // Soft Amber Tint
  moderateBorder: "#FDE68A",

  recover: "#C92A2A",          // Terracotta / Crimson (Rest & Restore)
  recoverBackground: "#FFF5F5",
  recoverLight: "#FFF5F5", // Soft Rose Tint
  recoverBorder: "#FFC9C9",

  // Feedback
  error: "#C92A2A",
  errorBackground: "#FFF5F5",
  errorBorder: "#FFC9C9",

  success: "#2B8A3E",
  successBackground: "#EBFBEE",

  // UI Interactive States
  disabled: "#E6DFD3",
  disabledText: "#8C959F",
  overlay: "rgba(31, 41, 51, 0.4)",
} as const;
