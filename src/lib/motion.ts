export function shouldReduceMotion(systemPreference: boolean, manualPreference: boolean) {
  return systemPreference || manualPreference;
}

export function timelineProgress(top: number, height: number, viewportHeight: number) {
  // Start when the top enters the viewport; finish when the bottom enters it.
  return Math.max(0, Math.min(1, (viewportHeight - top) / Math.max(1, height)));
}
