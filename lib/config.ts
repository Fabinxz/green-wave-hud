export const APP_CONFIG = {
  // Simulation Mode
  SIMULATION_MODE: true,

  // Mock Cycle Parameters (seconds)
  MOCK_CYCLE_DURATION: 60,
  MOCK_GREEN_DURATION: 25,
  MOCK_YELLOW_DURATION: 3,
  // Red duration is calculated derived from the above in logic, but context helps: 60 - 25 - 3 = 32
  
  // Defaults
  DEFAULT_DESCENT_TIME: 12,
  DEFAULT_CYCLE_DURATION: 60,
  DEFAULT_GREEN_DURATION: 25,
  
  // Safety Margins
  EARLY_MARGIN: 2,
  LATE_MARGIN: 2,
  COUNTDOWN_WARNING_THRESHOLD: 5,
};
