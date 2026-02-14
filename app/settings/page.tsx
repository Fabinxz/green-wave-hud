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

                        <p className="text-white/70 mb-8 leading-relaxed text-sm max-w-lg mx-auto text-center">
                            Engage synchronization protocol at the <strong className="text-cyber-green">EXACT MOMENT</strong> the traffic light signal turns <span className="text-cyber-green">GREEN</span>.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSync}
                            className={`relative w-full py-8 rounded-sm font-black text-2xl tracking-[0.2em] transition-all overflow-hidden border border-white/10 group
                        ${synced
                                    ? 'bg-cyber-green text-black shadow-neon-green border-cyber-green'
                                    : 'bg-black/40 hover:bg-cyber-green/10 text-white border-white/10 hover:border-cyber-green/50 hover:shadow-[0_0_30px_rgba(0,255,65,0.2)]'
                                }`}
                        >
                            {/* Scanline inside button */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                            <span className="relative z-10">{synced ? 'SYNC CONFIRMED' : 'SYNC ENGINE'}</span>

                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-30" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-30" />
                        </motion.button>
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
                                    min="5" max="30" step="0.5"
                                    value={descentTime}
                                    onChange={(e) => setDescentTime(parseFloat(e.target.value))}
                                    className="text-cyber-cyan z-20"
                                />
                                {/* Custom Track Background for Visuals */}
                                <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 h-1 bg-cyber-cyan/30 rounded-full z-10 pointer-events-none" style={{ width: `${((descentTime - 5) / 25) * 100}%` }} />
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
                                    className="text-cyber-cyan z-20" // Unified to Cyan
                                />
                                <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 h-1 bg-cyber-cyan/30 rounded-full z-10 pointer-events-none" style={{ width: `${((greenDuration - 10) / 50) * 100}%` }} />
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
