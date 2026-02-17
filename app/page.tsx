'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { getCurrentLightState, calculateDecision, LightState, DecisionResult } from '@/lib/trafficLogic';
import { APP_CONFIG } from '@/lib/config';
import TrafficLight from '@/components/TrafficLight';
import LaunchDecision from '@/components/LaunchDecision';
import CountdownTimer from '@/components/CountdownTimer';
import GlassPanel from '@/components/GlassPanel';

export default function Home() {
  const {
    descentTime,
    cycleDuration,
    greenDuration,
    yellowDuration,
    syncTimestamp,
    calibrationMethod,
    calibrationQuality
  } = useStore();

  const [currentLight, setCurrentLight] = useState<LightState>('RED');
  const [decision, setDecision] = useState<DecisionResult>({
    decision: 'HOLD',
    timeUntilGreen: 0,
    arrivalPhase: 0
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      // 1. Get current light state
      const lightState = getCurrentLightState(
        syncTimestamp,
        cycleDuration,
        greenDuration,
        yellowDuration
      );
      setCurrentLight(lightState);

      // 2. Calculate Decision
      const decisionResult = calculateDecision(
        descentTime,
        syncTimestamp,
        cycleDuration,
        greenDuration,
        yellowDuration,
        APP_CONFIG.EARLY_MARGIN,
        APP_CONFIG.LATE_MARGIN
      );
      setDecision(decisionResult);

    }, 100); // 10Hz update

    return () => clearInterval(interval);
  }, [descentTime, cycleDuration, greenDuration, yellowDuration, syncTimestamp]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <main className="min-h-screen relative flex flex-col items-center py-8 px-6 overflow-hidden bg-cyber-black selection:bg-cyber-cyan/30">

      {/* Background Elements */}
      {/* 1. Subtle Radial Gradient Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 2. Refined Grid Pattern (Larger, more subtle) */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-40"
      />

      {/* Settings Button - Top Right Fixed */}
      <Link href="/settings">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-6 right-6 p-2.5 rounded-lg border border-white/10 text-white/50 hover:text-cyber-cyan hover:border-cyber-cyan/50 hover:bg-white/5 transition-all z-50 cursor-pointer"
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0-.73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </motion.div>
      </Link>

      <div className="flex flex-col items-center w-full max-w-lg z-10 pt-4">

        {/* 1. Traffic Light */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 mb-4"
        >
          <TrafficLight state={currentLight} size="lg" />
        </motion.div>

        {/* Divider for visual separation */}
        {/* Divider / Cycle Status */}
        <div className="w-full max-w-[200px] flex items-center justify-center space-x-2 mb-4 opacity-50">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
          <div className="w-2 h-2 transform rotate-45 border border-white/20 bg-black" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
        </div>

        {/* 2. Launch Decision */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-20 w-full mb-6"
        >
          <LaunchDecision decision={decision.decision} />
        </motion.div>

        {/* 3. Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full mb-4"
        >
          <CountdownTimer targetSeconds={decision.timeUntilGreen} />
        </motion.div>

        {/* 4. Unified Technical Readout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <GlassPanel className="flex items-center justify-center p-4 divide-x divide-white/10">
            <div className="flex-1 flex flex-col items-center px-4">
              <span className="technical-label text-white/40 mb-1">DESCENT</span>
              <span className="text-3xl font-black text-cyber-cyan tabular-nums">
                {descentTime.toFixed(1)}<span className="text-xl font-normal text-white/30 ml-1">s</span>
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center px-4">
              <span className="technical-label text-white/40 mb-1">CYCLE</span>
              <span className="text-3xl font-black text-cyber-cyan tabular-nums">
                {cycleDuration}<span className="text-xl font-normal text-white/30 ml-1">s</span>
              </span>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Footer / System Status Bar */}
      <footer className="mt-auto w-full max-w-lg flex items-center justify-between py-4 px-6 border-t border-white/5 bg-black/20 backdrop-blur-sm rounded-t-xl opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          <span className="technical-label text-[10px] tracking-widest text-cyber-green/80">SYSTEM ONLINE</span>
        </div>

        {/* Calibration Status Indicator */}
        <Link href="/settings/camera-sync">
          <div className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
            <div className={`w-2 h-2 rounded-full ${calibrationMethod === 'none' ? 'bg-cyber-red' :
                calibrationMethod === 'camera-triple' ? 'bg-cyber-green' :
                  'bg-cyber-amber'
              }`} />
            <span className={`technical-label text-[10px] tracking-wider ${calibrationMethod === 'none' ? 'text-cyber-red/80' :
                calibrationMethod === 'camera-triple' ? 'text-cyber-green/80' :
                  'text-cyber-amber/80'
              }`}>
              {calibrationMethod === 'none' ? 'NO SYNC' :
                calibrationMethod === 'camera-triple' ? 'CALIBRATED' :
                  'BASIC SYNC'}
            </span>
          </div>
        </Link>

        <span className="technical-label text-[10px] text-white/20">v2.0 PRO</span>
      </footer>
    </main>
  );
}
