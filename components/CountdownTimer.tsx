'use client';

import { motion } from 'framer-motion';
import { APP_CONFIG } from '@/lib/config';

interface CountdownTimerProps {
    targetSeconds: number;
    label?: string;
}

export default function CountdownTimer({ targetSeconds, label = 'TIME TO GREEN' }: CountdownTimerProps) {
    // Format logic
    const seconds = Math.floor(targetSeconds);
    const tenths = Math.floor((targetSeconds - seconds) * 10);

    // Warning threshold check (<= 2s is critical now as per prompt)
    const isCritical = targetSeconds <= 2;
    const isWarning = targetSeconds <= APP_CONFIG.COUNTDOWN_WARNING_THRESHOLD;

    const textColor = isWarning
        ? 'text-cyber-amber glow-text-amber'
        : 'text-cyber-cyan glow-text-cyan';

    return (
        <div className={`relative w-full max-w-lg mx-auto flex flex-col items-center justify-center py-10 px-8 rounded-2xl glass-panel border border-white/10 ${isCritical ? 'border-cyber-amber/50 shadow-neon-amber' : ''}`}>
            {label && <span className="technical-label mb-6">{label}</span>}

            <div className={`flex items-baseline ${textColor} font-mono tabular-nums leading-none`}>
                {/* Seconds */}
                <motion.span
                    animate={isCritical ? { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] } : {}}
                    transition={isCritical ? { duration: 0.5, repeat: Infinity } : {}}
                    className="text-7xl md:text-8xl font-bold tracking-tighter"
                >
                    {seconds.toString().padStart(2, '0')}
                </motion.span>

                {/* Decimal Point */}
                <span className="text-4xl opacity-50 mx-2 self-end mb-4">.</span>

                {/* Tenths */}
                <span className="text-5xl self-end mb-2">
                    {tenths}
                </span>
            </div>

            {/* Unit Label - Integrated below */}
            <div className="text-xl text-white/40 font-mono mt-2 tracking-widest">SECONDS</div>
        </div>
    );
}
