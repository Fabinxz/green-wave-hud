'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import GlassPanel from '@/components/GlassPanel';

export default function SettingsPage() {
    const {
        descentTime, setDescentTime,
        cycleDuration, setCycleDuration,
        greenDuration, setGreenDuration,
        yellowDuration, setYellowDuration,
        calibrationMethod, calibrationQuality, calibrationTimestamp, measuredCycle,
        syncNow, resetToDefaults
    } = useStore();

    const [synced, setSynced] = useState(false);

    // Sync Logic
    const handleSync = () => {
        syncNow();
        setSynced(true);
        setTimeout(() => setSynced(false), 2000); // 2s feedback
    };

    return (
        <main className="min-h-screen relative flex flex-col items-center py-8 px-6 overflow-hidden bg-cyber-black selection:bg-cyber-cyan/30 text-white font-mono">

            {/* Background Elements (Shared with Main Page) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-amber/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,176,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,176,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-30" />

            {/* Header */}
            <header className="w-full max-w-2xl flex justify-between items-center mb-12 z-10">
                <Link href="/">
                    <motion.div
                        className="flex items-center space-x-3 text-white/50 hover:text-cyber-cyan transition-colors cursor-pointer group"
                        whileHover={{ x: -4 }}
                    >
                        <div className="p-1 border border-white/10 rounded group-hover:border-cyber-cyan/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </div>
                        <span className="technical-label text-sm tracking-widest">BACK TO COCKPIT</span>
                    </motion.div>
                </Link>

                <div className="flex flex-col items-end">
                    <h1 className="text-3xl font-black tracking-tight text-white/90">ENGINE ROOM</h1>
                    <span className="technical-label text-[10px] text-cyber-amber">CONFIGURATION & CALIBRATION</span>
                </div>
            </header>

            <div className="flex-1 w-full max-w-2xl space-y-12 z-10 pb-20">

                {/* Section 1: SYSTEM CALIBRATION (Unified Cyan Theme) */}
                <section className="space-y-4">
                    <div className="flex items-center space-x-4 mb-2">
                        <div className="h-px bg-cyber-cyan/30 flex-1" />
                        <h2 className="technical-label text-cyber-cyan glow-text-cyan text-sm">SYSTEM SYNC</h2>
                        <div className="h-px bg-cyber-cyan/30 flex-1" />
                    </div>

                    <GlassPanel className="p-8 relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyber-cyan" />

                        {calibrationMethod === 'none' ? (
                            <div className="mb-6 p-4 border border-cyber-amber/30 bg-cyber-amber/5 rounded">
                                <p className="text-cyber-amber text-xs tracking-wide flex items-center gap-2">
                                    <span className="text-xl">⚠</span>
                                    <span>SYSTEM NOT CALIBRATED — Using estimated values</span>
                                </p>
                            </div>
                        ) : (
                            <div className="mb-6 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/50">LAST CALIBRATION</span>
                                    <span className="text-white/70">
                                        {calibrationTimestamp ? new Date(calibrationTimestamp).toLocaleString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/50">METHOD</span>
                                    <span className="text-cyber-cyan font-mono">
                                        {calibrationMethod === 'manual' ? 'MANUAL' :
                                            calibrationMethod === 'camera-single' ? 'CAMERA (1x)' :
                                                calibrationMethod === 'camera-triple' ? 'CAMERA (3x)' : 'UNKNOWN'}
                                    </span>
                                </div>
                                {measuredCycle && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/50">MEASURED CYCLE</span>
                                        <span className="text-white/70 font-mono">{measuredCycle.toFixed(1)}s</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/50">QUALITY</span>
                                    <span className={`font-bold ${calibrationQuality >= 80 ? 'text-cyber-green' :
                                            calibrationQuality >= 50 ? 'text-cyber-amber' : 'text-cyber-red'
                                        }`}>
                                        {calibrationQuality >= 80 ? 'HIGH' :
                                            calibrationQuality >= 50 ? 'MEDIUM' : 'LOW'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <Link href="/settings/camera-sync">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative w-full py-8 rounded-sm font-black text-2xl tracking-[0.2em] transition-all overflow-hidden border border-white/10 group bg-black/40 hover:bg-cyber-cyan/10 text-white border-white/10 hover:border-cyber-cyan/50 hover:shadow-[0_0_30px_rgba(0,255,235,0.2)]"
                            >
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                                <span className="relative z-10">CALIBRATE WITH CAMERA</span>
                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-30" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-30" />
                            </motion.button>
                        </Link>

                        <div className="mt-4 text-center">
                            <button
                                onClick={handleSync}
                                className="text-xs text-white/40 hover:text-cyber-cyan transition-colors tracking-wider"
                            >
                                or sync manually now
                            </button>
                        </div>
                    </GlassPanel>
                </section>

                {/* Section 2: FLIGHT PARAMETERS (Unified Cyan Theme) */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-4 mb-2">
                        <div className="h-px bg-cyber-cyan/30 flex-1" />
                        <h2 className="technical-label text-cyber-cyan glow-text-cyan text-sm">FLIGHT PARAMETERS</h2>
                        <div className="h-px bg-cyber-cyan/30 flex-1" />
                    </div>

                    <GlassPanel className="p-8 space-y-10 relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 w-1 h-full bg-cyber-cyan" />

                        {/* Descent Time Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="technical-label text-cyber-cyan">DESCENT TIME</label>
                                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                    {descentTime.toFixed(1)}<span className="text-lg font-normal text-white/30 ml-1">s</span>
                                </span>
                            </div>
                            <div className="relative h-6 flex items-center">
                                <input
                                    type="range"
                                    min="5" max="120" step="1"
                                    value={descentTime}
                                    onChange={(e) => setDescentTime(parseFloat(e.target.value))}
                                    className="text-cyber-cyan z-20"
                                />
                                {/* Custom Track Background for Visuals */}
                                <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 h-1 bg-cyber-cyan/30 rounded-full z-10 pointer-events-none" style={{ width: `${((descentTime - 5) / 115) * 100}%` }} />
                            </div>
                        </div>

                        {/* Cycle Duration Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="technical-label text-cyber-cyan">FULL CYCLE DURATION</label>
                                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                    {cycleDuration}<span className="text-lg font-normal text-white/30 ml-1">s</span>
                                </span>
                            </div>
                            <div className="relative h-6 flex items-center">
                                <input
                                    type="range"
                                    min="30" max="120" step="5"
                                    value={cycleDuration}
                                    onChange={(e) => setCycleDuration(parseFloat(e.target.value))}
                                    className="text-cyber-cyan z-20"
                                />
                                <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 h-1 bg-cyber-cyan/30 rounded-full z-10 pointer-events-none" style={{ width: `${((cycleDuration - 30) / 90) * 100}%` }} />
                            </div>
                        </div>

                        {/* Green Phase Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="technical-label text-cyber-cyan">GREEN PHASE DURATION</label>
                                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                    {greenDuration}<span className="text-lg font-normal text-white/30 ml-1">s</span>
                                </span>
                            </div>
                            <div className="relative h-6 flex items-center">
                                <input
                                    type="range"
                                    min="10" max="60" step="5"
                                    value={greenDuration}
                                    onChange={(e) => setGreenDuration(parseFloat(e.target.value))}
                                    className="text-cyber-cyan z-20"
                                />
                                <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 h-1 bg-cyber-cyan/30 rounded-full z-10 pointer-events-none" style={{ width: `${((greenDuration - 10) / 50) * 100}%` }} />
                            </div>
                        </div>

                        {/* Yellow Phase Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="technical-label text-cyber-cyan">YELLOW PHASE DURATION</label>
                                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                    {yellowDuration}<span className="text-lg font-normal text-white/30 ml-1">s</span>
                                </span>
                            </div>
                            <div className="relative h-6 flex items-center">
                                <input
                                    type="range"
                                    min="2" max="8" step="0.5"
                                    value={yellowDuration}
                                    onChange={(e) => setYellowDuration(parseFloat(e.target.value))}
                                    className="text-cyber-cyan z-20"
                                />
                                <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 h-1 bg-cyber-cyan/30 rounded-full z-10 pointer-events-none" style={{ width: `${((yellowDuration - 2) / 6) * 100}%` }} />
                            </div>
                        </div>

                        <div className="absolute bottom-2 right-4 text-[9px] text-white/20 font-mono tracking-widest">
                            CONFIG.SYS.RW
                        </div>
                    </GlassPanel>
                </section>

                {/* Section 3: RESET ZONE (Red) */}
                <section className="pt-8 opacity-60 hover:opacity-100 transition-opacity">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={resetToDefaults}
                        className="w-full py-4 border border-cyber-red/20 text-cyber-red/70 font-bold tracking-widest hover:bg-cyber-red/10 hover:border-cyber-red transition-all flex items-center justify-center space-x-2 text-xs rounded-sm"
                    >
                        <div className="w-2 h-2 bg-cyber-red rounded-full" />
                        <span>FACTORY RESET PROTOCOL</span>
                    </motion.button>
                </section>

            </div>
        </main>
    );
}
