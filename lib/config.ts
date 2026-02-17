export const APP_CONFIG = {
  // Simulation Mode
  SIMULATION_MODE: true,

  // Mock Cycle Parameters (seconds) - Real field measurements
  MOCK_CYCLE_DURATION: 90,
  MOCK_GREEN_DURATION: 35,
  MOCK_YELLOW_DURATION: 4,
  // Red duration is calculated derived from the above in logic: 90 - 35 - 4 = 51

  // Defaults - Real field measurements
  DEFAULT_DESCENT_TIME: 50,
  DEFAULT_CYCLE_DURATION: 90,
  DEFAULT_GREEN_DURATION: 35,
  DEFAULT_YELLOW_DURATION: 4,

  // Safety Margins
  EARLY_MARGIN: 2,
  LATE_MARGIN: 2,
  COUNTDOWN_WARNING_THRESHOLD: 5,
};
