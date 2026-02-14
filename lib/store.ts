import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_CONFIG } from './config';

interface AppState {
    descentTime: number;
    cycleDuration: number;
    greenDuration: number;
    yellowDuration: number;
    syncTimestamp: number;
}

interface AppActions {
    setDescentTime: (time: number) => void;
    setCycleDuration: (duration: number) => void;
    setGreenDuration: (duration: number) => void;
    syncNow: () => void;
    resetToDefaults: () => void;
}

const DEFAULT_STATE: AppState = {
    descentTime: APP_CONFIG.DEFAULT_DESCENT_TIME,
    cycleDuration: APP_CONFIG.DEFAULT_CYCLE_DURATION,
    greenDuration: APP_CONFIG.DEFAULT_GREEN_DURATION,
    yellowDuration: APP_CONFIG.MOCK_YELLOW_DURATION,
    syncTimestamp: Date.now(), // Will be updated on sync
};

export const useStore = create<AppState & AppActions>()(
    persist(
        (set) => ({
            ...DEFAULT_STATE,

            setDescentTime: (time) => set({ descentTime: time }),
            setCycleDuration: (duration) => set({ cycleDuration: duration }),
            setGreenDuration: (duration) => set({ greenDuration: duration }),

            syncNow: () => set({ syncTimestamp: Date.now() }),

            resetToDefaults: () => set({
                ...DEFAULT_STATE,
                syncTimestamp: Date.now(), // Reset sync to now as well? Or keep? Usually reset implies full reset.
            }),
        }),
        {
            name: 'green-wave-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
