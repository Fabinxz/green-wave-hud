export type LightState = 'GREEN' | 'YELLOW' | 'RED';
export type Decision = 'LAUNCH' | 'HOLD' | 'CAUTION';

export interface DecisionResult {
    decision: Decision;
    timeUntilGreen: number;
    arrivalPhase: number; // The elapsed time in cycle when user arrives
}

/**
 * Calculates the current state of the traffic light based on sync time
 */
export function getCurrentLightState(
    syncTimestamp: number,
    cycleDuration: number,
    greenDuration: number,
    yellowDuration: number
): LightState {
    const now = Date.now();
    // Ensure we don't have negative elapsed time if system clock drifts slightly or sync is future (unlikely)
    const elapsed = Math.max(0, (now - syncTimestamp) / 1000);
    const cyclePosition = elapsed % cycleDuration;

    if (cyclePosition < greenDuration) {
        return 'GREEN';
    } else if (cyclePosition < greenDuration + yellowDuration) {
        return 'YELLOW';
    } else {
        return 'RED';
    }
}

/**
 * Calculates magnitude of seconds until the next green light
 */
export function getTimeUntilGreen(
    syncTimestamp: number,
    cycleDuration: number,
    greenDuration: number
): number {
    const now = Date.now();
    const elapsed = Math.max(0, (now - syncTimestamp) / 1000);
    const cyclePosition = elapsed % cycleDuration;

    // If currently green (and not near end? Logic simplifies to Next Green Start)
    // Actually, if it IS green, time until NEXT green is: (cycleDuration - cyclePosition)
    // If it is NOT green, time until NEXT green is: (cycleDuration - cyclePosition)
    // Wait, no.
    // If cyclePosition < greenDuration (It IS Green). Time until NEXT green start is:
    // (greenDuration - cyclePosition) + (cycleDuration - greenDuration) = cycleDuration - cyclePosition.
    // ... Wait. If it is green, we want to know time until it TURNS green again? 
    // No, usually "Time To Green" means "Time until the light BECOMES green".
    // If it is already green, strictly speaking 0? Or time until NEXT cycle?
    // Let's assume standard countdown:
    // If Green: 0 (or display duration remaining? But request says "Time Until Green").
    // If Red/Yellow: Time remaining until start of Green.

    // However, for the HUD, knowing when the NEXT green starts allows predicting arrival window.
    // Let's interpret "Time Until Green" as:
    // If NOT Green: Seconds until Green starts.
    // If ALREADY Green: 0? Or maybe countdown to Red?
    // The requirement says "Function 2: getTimeUntilGreen... Handle edge case: if currently green, return time until NEXT cycle's green".

    if (cyclePosition < greenDuration) {
        // Currently Green. Time until NEXT green is remaining green + non-green time = cycleDuration - cyclePosition
        return cycleDuration - cyclePosition;
    } else {
        // Currently Yellow or Red. Time until Green is simply:
        return cycleDuration - cyclePosition;
    }
}

/**
 * CORE ALGORITHM: Decides if cyclist should launch
 */
export function calculateDecision(
    descentTime: number,
    syncTimestamp: number,
    cycleDuration: number,
    greenDuration: number,
    yellowDuration: number,
    earlyMargin: number,
    lateMargin: number
): DecisionResult {
    // Safety: Prevent division by zero or negative durations
    if (cycleDuration <= 0) cycleDuration = 60;
    if (greenDuration <= 0) greenDuration = 30;
    // Safety: Green cannot exceed cycle
    if (greenDuration > cycleDuration) greenDuration = cycleDuration;

    const now = Date.now();
    const arrivalTime = now + descentTime * 1000;

    // Elapsed time at moment of arrival
    const arrivalElapsed = Math.max(0, (arrivalTime - syncTimestamp) / 1000);
    const arrivalPhase = arrivalElapsed % cycleDuration;

    // Decision Logic
    // Green Phase is [0, greenDuration)
    const greenStart = 0;
    const greenEnd = greenDuration;

    // Check if arrival is generally within Green Phase
    const isGreen = arrivalPhase >= greenStart && arrivalPhase < greenEnd;

    let decision: Decision = 'HOLD';

    if (isGreen) {
        // "Early Margin": buffer at start of green (don't arrive usually before this)
        // "Late Margin": buffer at end of green (don't arrive after this)
        const safeStart = greenStart + earlyMargin;
        const safeEnd = greenEnd - lateMargin;

        if (arrivalPhase >= safeStart && arrivalPhase <= safeEnd) {
            decision = 'LAUNCH';
        } else {
            // It's green, but within the risky margins
            decision = 'CAUTION';
        }
    } else {
        decision = 'HOLD';
    }

    // Calculate generic countdown to next green for display
    const timeUntilGreen = getTimeUntilGreen(syncTimestamp, cycleDuration, greenDuration);

    return {
        decision,
        timeUntilGreen,
        arrivalPhase
    };
}
