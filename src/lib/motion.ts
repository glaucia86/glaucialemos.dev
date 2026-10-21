export function shouldReduceMotion(systemPreference: boolean, manualPreference: boolean) {
  return systemPreference || manualPreference;
}
