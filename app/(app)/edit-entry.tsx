import React from "react";
import CheckInScreen from "./check-in";

/**
 * Screen for editing a historical recovery entry.
 * Reuses the CheckInScreen with route parameters (e.g. ?date=YYYY-MM-DD or ?id=UUID).
 */
export default function EditEntryScreen() {
  return <CheckInScreen />;
}
