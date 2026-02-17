import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_CONFIG } from './config';

type CalibrationMethod = 'none' | 'manual' | 'camera-single' | 'camera-triple';

interface AppState {
    descentTime: number;
    cycleDuration: number;
    greenDuration: number;
    yellowDuration: number;
    syncTimestamp: number;

    // Calibration metadata
    calibrationMethod: CalibrationMethod;
    calibrationQuality: number; // 0-100 score
    calibrationTimestamp: number | null;
    measuredCycle: number | null; // Actual measured cycle from camera
}

interface AppActions {
    setDescentTime: (time: number) => void;
    setCycleDuration: (duration: number) => void;
    setGreenDuration: (duration: number) => void;
    setYellowDuration: (duration: number) => void;
    syncNow: () => void;
    setCameraSync: (data: {
        timestamp: number;
        method: CalibrationMethod;
        quality: number;
        measuredCycle: number;
    }) => void;
    resetToDefaults: () => void;
}

const DEFAULT_STATE: AppState = {
    descentTime: APP_CONFIG.DEFAULT_DESCENT_TIME,
    cycleDuration: APP_CONFIG.DEFAULT_CYCLE_DURATION,
    greenDuration: APP_CONFIG.DEFAULT_GREEN_DURATION,
    yellowDuration: APP_CONFIG.DEFAULT_YELLOW_DURATION,
    syncTimestamp: Date.now(),
    calibrationMethod: 'none',
    calibrationQuality: 0,
    calibrationTimestamp: null,
    measuredCycle: null,
};

export const useStore = create<AppState & AppActions>()(
    persist(
        (set) => ({
            ...DEFAULT_STATE,

            setDescentTime: (time) => set({ descentTime: time }),
            setCycleDuration: (duration) => set({ cycleDuration: duration }),
            setGreenDuration: (duration) => set({ greenDuration: duration }),
            setYellowDuration: (duration) => set({ yellowDuration: duration }),

            syncNow: () => set({
                syncTimestamp: Date.now(),
                calibrationMethod: 'manual',
                calibrationTimestamp: Date.now(),
                calibrationQuality: 50, // Manual sync gets medium quality
            }),

            setCameraSync: (data) => set({
                syncTimestamp: data.timestamp,
                calibrationMethod: data.method,
                calibrationQuality: data.quality,
                calibrationTimestamp: Date.now(),
                measuredCycle: data.measuredCycle,
                cycleDuration: data.measuredCycle, // Auto-update cycle duration
            }),

            resetToDefaults: () => set({
                ...DEFAULT_STATE,
                syncTimestamp: Date.now(),
            }),
        }),
        {
            name: 'green-wave-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
