'use client';

import React from 'react';

import { motion } from 'framer-motion';
import GlassPanel from './GlassPanel';
import { LightState } from '@/lib/trafficLogic';

interface TrafficLightProps {
    state: LightState;
    size?: 'sm' | 'md' | 'lg';
}

export default function TrafficLight({ state, size = 'lg' }: TrafficLightProps) {
    // Dimensions based on size
    const dimensions = {
        sm: { housing: 'w-24 py-4', light: 'w-14 h-14', gap: 'gap-3' },
        md: { housing: 'w-32 py-6', light: 'w-20 h-20', gap: 'gap-4' },
        lg: { housing: 'w-48 py-8', light: 'w-24 h-24', gap: 'gap-6' },
    };

    const currentDim = dimensions[size];

    // Animation variants
    const activeLight = {
        scale: [1, 1.02, 1], // Very subtle breathing
        filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'], // Brightness pulse
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    };

    const inactiveLight = {
        scale: 1,
        filter: 'brightness(0.5)'// Dimmed look for inactive
    };

    // Outer ring animation - clearer definition
    const glowRing = {
        opacity: [0, 0.4, 0],
        scale: [1, 1.1, 1.2],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeOut" as const
        }
    };

    // Helper to render a single light
    const renderLight = (color: 'red' | 'yellow' | 'green', isActive: boolean) => {
        let baseColor = '';
        let glowClass = '';
        let coreColor = '';
        let borderColor = '';

        // Semantic Color Mapping
        switch (color) {
            case 'red':
                baseColor = isActive ? 'bg-cyber-red' : 'bg-black';
                glowClass = isActive ? 'shadow-[0_0_50px_var(--color-cyber-red)]' : 'shadow-inner shadow-black';
                coreColor = 'bg-white'; // Hot core
                borderColor = 'border-cyber-red';
                break;
            case 'yellow':
                baseColor = isActive ? 'bg-cyber-amber' : 'bg-black';
                glowClass = isActive ? 'shadow-[0_0_50px_var(--color-cyber-amber)]' : 'shadow-inner shadow-black';
                coreColor = 'bg-white';
                borderColor = 'border-cyber-amber';
                break;
            case 'green':
                baseColor = isActive ? 'bg-cyber-green' : 'bg-black';
                glowClass = isActive ? 'shadow-[0_0_50px_var(--color-cyber-green)]' : 'shadow-inner shadow-black';
                coreColor = 'bg-white';
                borderColor = 'border-cyber-green';
                break;
        }

        return (
            <div className="relative flex items-center justify-center pointer-events-none">
                {/* Expanding Glow Ring (only active) */}
                {isActive && (
                    <motion.div
                        className={`absolute inset-0 rounded-full border ${borderColor} opacity-50`}
                        animate={glowRing}
                    />
                )}

                {/* The Light Itself */}
                <motion.div
                    className={`rounded-full ${currentDim.light} ${baseColor} ${glowClass} relative overflow-hidden z-10 border border-white/10`}
                    animate={isActive ? activeLight : inactiveLight}
                >
                    {/* 1. Carbon fiber / Hex texture pattern overlay (subtle) */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                    {/* 2. Inner Shadow for depth */}
                    <div className="absolute inset-0 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] rounded-full pointer-events-none" />

                    {/* 3. Glossy Reflection (Glass Lens effect) - Sharp */}
                    <div className="absolute top-[10%] left-[25%] w-[30%] h-[15%] bg-gradient-to-b from-white/90 to-transparent rounded-[50%] skew-x-[-15deg] blur-[0.5px] opacity-60" />

                    {/* 4. Active State: Bright Core Plasma */}
                    {isActive && (
                        <motion.div
                            animate={{ opacity: [0.8, 1, 0.8], scale: [0.9, 1, 0.9] }}
                            transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
                            className={`absolute inset-[25%] rounded-full ${coreColor} blur-md mix-blend-overlay`}
                        />
                    )}
                </motion.div>
            </div>
        );
    };

    return (
        <div className={`relative flex flex-col items-center justify-center ${currentDim.housing} ${currentDim.gap} rounded-3xl bg-cyber-gray border-t border-t-white/20 border-b border-b-black shadow-2xl overflow-hidden`}>
            {/* 1. Housing Texture (Noise) */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0 pointer-events-none mix-blend-overlay" />

            {/* 2. Metallic Rim Highlight - Semantic Cyan Trace */}
            <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none z-20" />

            {/* 3. Top Hood/Visor Overlay */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />

            {/* Render Lights */}
            {renderLight('red', state === 'RED')}
            {renderLight('yellow', state === 'YELLOW')}
            {renderLight('green', state === 'GREEN')}
        </div>
    );
}
