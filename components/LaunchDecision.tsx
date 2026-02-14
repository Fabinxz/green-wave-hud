'use client';

import React from 'react';

import { motion } from 'framer-motion';
import { Decision } from '@/lib/trafficLogic';

interface LaunchDecisionProps {
    decision: Decision;
}

export default function LaunchDecision({ decision }: LaunchDecisionProps) {
    // Styles based on decision
    const styles = {
        LAUNCH: {
            text: 'text-cyber-cyan glow-text-cyan',
            shadow: 'shadow-neon-cyan',
            bg: 'bg-cyber-cyan/10', // Slightly increased opacity
            indicator: 'bg-cyber-cyan shadow-neon-cyan',
            label: 'LAUNCH'
        },
        HOLD: {
            text: 'text-cyber-red glow-text-red',
            shadow: 'shadow-neon-red',
            bg: 'bg-cyber-red/10',
            indicator: 'bg-cyber-red shadow-neon-red',
            label: 'HOLD'
        },
        CAUTION: {
            text: 'text-cyber-amber glow-text-amber',
            shadow: 'shadow-neon-amber',
            bg: 'bg-cyber-amber/10',
            indicator: 'bg-cyber-amber shadow-neon-amber',
            label: 'CAUTION'
        }
    };

    const currentStyle = styles[decision];

    return (
        <motion.div
            key={decision} // Re-animate on change
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className={`relative w-full max-w-md flex flex-col items-center justify-center py-12 px-8 overflow-hidden rounded-sm backdrop-blur-xl ${currentStyle.bg} border-x border-white/5`}
        >
            {/* Corner Brackets - Top Left */}
            <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${currentStyle.text} opacity-50`} />
            {/* Corner Brackets - Top Right */}
            <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${currentStyle.text} opacity-50`} />
            {/* Corner Brackets - Bottom Left */}
            <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${currentStyle.text} opacity-50`} />
            {/* Corner Brackets - Bottom Right */}
            <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${currentStyle.text} opacity-50`} />

            {/* Technical Labels */}
            <div className="absolute top-2 left-3 text-[9px] tracking-widest text-white/30 font-mono">SYS.DECISION</div>
            <div className="absolute bottom-2 right-3 text-[9px] tracking-widest text-white/30 font-mono">CONF. 99%</div>

            {/* Background Glow - pushed back and subtle */}
            <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 ${currentStyle.bg} blur-3xl -z-10`}
            />

            {/* Text Sizing: 7xl mobile, 8xl desktop, No Wrap */}
            <h1 className={`text-7xl md:text-8xl leading-none font-black font-mono tracking-tighter z-10 ${currentStyle.text} whitespace-nowrap drop-shadow-2xl`}>
                {currentStyle.label}
            </h1>

            {/* Indicator Bar at bottom */}
            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute bottom-0 left-12 right-12 h-0.5 rounded-full ${currentStyle.indicator}`}
            />

            {/* Scanline effect overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-10" />
        </motion.div>
    );
}
