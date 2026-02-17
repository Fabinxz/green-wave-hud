'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type SyncState =
    | 'PERMISSION'
    | 'REQUESTING_CAMERA'
    | 'TARGETING'
    | 'DETECTION'
    | 'WAITING_NEXT'
    | 'COMPLETE'
    | 'ERROR';

interface DetectionRecord {
    timestamp: number;
    cycleNumber: number;
    greenDuration?: number; // Duration of green phase in ms
}

interface CameraSyncProps {
    onComplete: (result: {
        syncTimestamp: number;
        measuredCycle: number;
        measuredGreen: number;
        quality: number;
    }) => void;
    onCancel: () => void;
}

export default function CameraSync({ onComplete, onCancel }: CameraSyncProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const lastDetectionTimeRef = useRef<number>(0);
    const greenStartTimeRef = useRef<number>(0); // When current green phase started
    const consecutiveDarkFramesRef = useRef<number>(0); // Frames without green

    const [state, setState] = useState<SyncState>('PERMISSION');
    const [error, setError] = useState<string>('');
    const [greenPercentage, setGreenPercentage] = useState(0);
    const [detections, setDetections] = useState<DetectionRecord[]>([]);
    const [consecutiveGreenFrames, setConsecutiveGreenFrames] = useState(0);
    const [frameCount, setFrameCount] = useState(0);
    const [timeUntilNext, setTimeUntilNext] = useState<number | null>(null);

    // Request camera permission
    const requestCamera = async () => {
        setState('REQUESTING_CAMERA');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 },
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setState('TARGETING');
            }
        } catch (err) {
            console.error('Camera access error:', err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setError('Camera permission denied. Please enable camera access in your browser settings.');
                } else if (err.name === 'NotFoundError') {
                    setError('No camera found. Please ensure your device has a rear camera.');
                } else {
                    setError('Camera access failed. Please try again.');
                }
            }
            setState('ERROR');
        }
    };

    // Analyze frame for green pixels
    const analyzeFrame = (): number => {
        if (!videoRef.current || !canvasRef.current) return 0;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return 0;

        // Draw current video frame to canvas (reduced resolution)
        canvas.width = 320;
        canvas.height = 240;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Define ROI (larger center region - 40% of frame for better coverage)
        const roiWidth = Math.floor(canvas.width * 0.4);
        const roiHeight = Math.floor(canvas.height * 0.4);
        const roiX = Math.floor((canvas.width - roiWidth) / 2);
        const roiY = Math.floor((canvas.height - roiHeight) / 2);

        const imageData = ctx.getImageData(roiX, roiY, roiWidth, roiHeight);
        const pixels = imageData.data;

        let greenPixels = 0;
        const totalPixels = roiWidth * roiHeight;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // More sensitive green detection algorithm
            // Lower multiplier (1.2) and lower brightness threshold (60)
            const isGreen =
                g > r * 1.2 &&
                g > b * 1.2 &&
                g > 60;

            if (isGreen) greenPixels++;
        }

        return (greenPixels / totalPixels) * 100;
    };

    // Analysis loop
    const runAnalysis = () => {
        if (state !== 'TARGETING' && state !== 'WAITING_NEXT') {
            return;
        }

        // Analyze EVERY frame for maximum responsiveness 
        const greenPct = analyzeFrame();
        setGreenPercentage(greenPct);

        // Check cooldown period (40 seconds since last cycle detection)
        const timeSinceLastDetection = performance.now() - lastDetectionTimeRef.current;
        const isInCooldown = timeSinceLastDetection < 40000 && lastDetectionTimeRef.current > 0;

        // Detect GREEN PHASE START (light turns ON)
        if (greenPct > 15 && !isInCooldown) {
            // Start tracking green phase if not already tracking
            if (greenStartTimeRef.current === 0) {
                greenStartTimeRef.current = performance.now();
            }

            consecutiveDarkFramesRef.current = 0;

            setConsecutiveGreenFrames((prev) => {
                const newConsecutive = prev + 1;

                // Trigger on first detection for instant response
                if (newConsecutive >= 1) {
                    handleGreenDetected();
                    return 0;
                }

                return newConsecutive;
            });
        } else if (greenPct <= 15) {
            // Detect GREEN PHASE END (light turns OFF)
            if (greenStartTimeRef.current > 0) {
                consecutiveDarkFramesRef.current++;

                // Require 10 consecutive dark frames to confirm green ended
                if (consecutiveDarkFramesRef.current >= 10) {
                    const greenDuration = performance.now() - greenStartTimeRef.current;
                    handleGreenEnded(greenDuration);
                    greenStartTimeRef.current = 0;
                    consecutiveDarkFramesRef.current = 0;
                }
            }

            setConsecutiveGreenFrames(0);
        }

        animationFrameRef.current = requestAnimationFrame(runAnalysis);
    };

    // Handle green light detection
    const handleGreenDetected = () => {
        // Use performance.now() for precision timing (no compensation hack)
        const timestamp = performance.now();

        // Update cooldown timer IMMEDIATELY
        lastDetectionTimeRef.current = timestamp;

        setDetections((prev) => {
            const newDetections = [...prev, { timestamp, cycleNumber: prev.length + 1 }];

            if (newDetections.length === 1) {
                setState('DETECTION');
                setTimeout(() => setState('WAITING_NEXT'), 300);

                // Visual feedback
                triggerFlash();
                triggerVibration();
            } else if (newDetections.length === 2) {
                // Validate interval (relaxed limits: 5s - 10min)
                const interval = timestamp - newDetections[0].timestamp;
                const intervalSeconds = Math.round(interval / 1000);

                if (interval < 40000 || interval > 600000) {
                    setState('ERROR');
                    setError(`Intervalo: ${intervalSeconds}s (esperado 40-600s). ${interval < 40000 ? 'Muito rápido - mesmo ciclo?' : 'Muito lento'}`);
                    return prev;
                }

                setState('DETECTION');
                setTimeout(() => setState('WAITING_NEXT'), 300);
                triggerFlash();
                triggerVibration();
            } else if (newDetections.length >= 3) {
                // Validate interval (relaxed limits: 5s - 10min)
                const interval = timestamp - newDetections[1].timestamp;
                const intervalSeconds = Math.round(interval / 1000);

                if (interval < 40000 || interval > 600000) {
                    setState('ERROR');
                    setError(`Intervalo: ${intervalSeconds}s (esperado 40-600s). ${interval < 40000 ? 'Muito rápido - mesmo ciclo?' : 'Muito lento'}`);
                    return prev;
                }

                // Complete calibration
                completeCalibration(newDetections);
            }

            return newDetections;
        });
    };

    // Handle green phase end (light turns OFF)
    const handleGreenEnded = (greenDuration: number) => {
        // Update the last detection record with the measured green duration
        setDetections((prev) => {
            if (prev.length === 0) return prev;

            const updatedDetections = [...prev];
            const lastIndex = updatedDetections.length - 1;
            updatedDetections[lastIndex] = {
                ...updatedDetections[lastIndex],
                greenDuration: greenDuration,
            };

            return updatedDetections;
        });
    };

    // Complete calibration with 3 detections
    const completeCalibration = (detectionRecords: DetectionRecord[]) => {
        const interval1 = detectionRecords[1].timestamp - detectionRecords[0].timestamp;
        const interval2 = detectionRecords[2].timestamp - detectionRecords[1].timestamp;

        const avgCycle = (interval1 + interval2) / 2000; // Convert to seconds
        const deviation = Math.abs(interval1 - interval2) / 1000;

        // Calculate average green duration from measurements
        const greenDurations = detectionRecords
            .filter(d => d.greenDuration !== undefined)
            .map(d => d.greenDuration!);

        const avgGreen = greenDurations.length > 0
            ? greenDurations.reduce((sum, dur) => sum + dur, 0) / greenDurations.length / 1000
            : 35; // Fallback to default if no measurements

        // Calculate quality score
        let quality = 100;
        if (deviation < 1) {
            quality = 100; // High precision
        } else if (deviation < 3) {
            quality = 70; // Medium precision
        } else {
            quality = 40; // Low precision
        }

        setState('COMPLETE');
        triggerFlash();
        triggerVibration();

        // Stop camera
        stopCamera();

        // Return results with measured green duration
        setTimeout(() => {
            onComplete({
                syncTimestamp: detectionRecords[2].timestamp,
                measuredCycle: Math.round(avgCycle),
                measuredGreen: Math.round(avgGreen),
                quality,
            });
        }, 1500);
    };

    // Visual feedback: flash
    const triggerFlash = () => {
        const flash = document.getElementById('flash-overlay');
        if (flash) {
            flash.style.opacity = '1';
            setTimeout(() => {
                flash.style.opacity = '0';
            }, 300);
        }
    };

    // Haptic feedback: vibration
    const triggerVibration = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 50, 50]);
        }
    };

    // Stop camera and cleanup
    const stopCamera = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Handle visibility change (pause when tab not visible)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            } else {
                if (state === 'TARGETING' || state === 'WAITING_NEXT') {
                    runAnalysis();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [state]);

    // Start analysis when in targeting state
    useEffect(() => {
        if (state === 'TARGETING' || state === 'WAITING_NEXT') {
            runAnalysis();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [state]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Timer for next expected cycle
    useEffect(() => {
        if (state === 'WAITING_NEXT' && detections.length > 0) {
            const lastDetection = detections[detections.length - 1];
            const interval = setInterval(() => {
                const elapsed = (Date.now() - lastDetection.timestamp) / 1000;
                setTimeUntilNext(elapsed);
            }, 100);

            return () => clearInterval(interval);
        }
    }, [state, detections]);

    // Get status text
    const getStatusText = () => {
        switch (state) {
            case 'PERMISSION':
                return 'CAMERA PERMISSION REQUIRED';
            case 'REQUESTING_CAMERA':
                return 'INITIALIZING CAMERA SYSTEMS...';
            case 'TARGETING':
                return 'POINT AT GREEN LIGHT AND WAIT';
            case 'DETECTION':
                return `GREEN DETECTED — ${detections.length} OF 3`;
            case 'WAITING_NEXT':
                return `WAITING FOR CYCLE ${detections.length + 1} OF 3...`;
            case 'COMPLETE':
                return 'CALIBRATION COMPLETE';
            case 'ERROR':
                return 'CALIBRATION ERROR';
            default:
                return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-cyber-black z-50 flex flex-col">
            {/* Flash overlay */}
            <div
                id="flash-overlay"
                className="fixed inset-0 bg-cyber-green pointer-events-none z-[100] transition-opacity duration-300 opacity-0"
            />

            {/* Video feed */}
            <div className="relative flex-1 overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Hidden canvas for analysis */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Targeting reticle - only show when active */}
                {(state === 'TARGETING' || state === 'WAITING_NEXT' || state === 'DETECTION') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            className={`relative w-64 h-64 border-2 ${state === 'DETECTION' ? 'border-cyber-green' : 'border-cyber-cyan'
                                } rounded-lg`}
                            animate={state === 'DETECTION' ? { scale: 1.1 } : {}}
                        >
                            {/* Animated corners */}
                            <motion.div
                                className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 ${state === 'DETECTION' ? 'border-cyber-green' : 'border-cyber-cyan'
                                    }`}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                                className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 ${state === 'DETECTION' ? 'border-cyber-green' : 'border-cyber-cyan'
                                    }`}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            />
                            <motion.div
                                className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 ${state === 'DETECTION' ? 'border-cyber-green' : 'border-cyber-cyan'
                                    }`}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                            />
                            <motion.div
                                className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 ${state === 'DETECTION' ? 'border-cyber-green' : 'border-cyber-cyan'
                                    }`}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                            />

                            {/* Center crosshair */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-1 h-full ${state === 'DETECTION' ? 'bg-cyber-green' : 'bg-cyber-cyan'} opacity-30`} />
                                <div className={`absolute h-1 w-full ${state === 'DETECTION' ? 'bg-cyber-green' : 'bg-cyber-cyan'} opacity-30`} />
                            </div>

                            {/* Instruction text */}
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <span className="text-cyber-cyan text-sm font-mono tracking-wider">
                                    {state === 'TARGETING' ? 'POINT AT GREEN LIGHT' :
                                        state === 'DETECTION' ? 'LOCKED' : 'SCANNING...'}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Color indicator (top right) */}
                {(state === 'TARGETING' || state === 'WAITING_NEXT') && (
                    <div className="absolute top-8 right-8 flex items-center gap-3">
                        <motion.div
                            className={`w-6 h-6 rounded-full border-2 ${greenPercentage > 40 ? 'bg-cyber-green border-cyber-green' :
                                greenPercentage > 20 ? 'bg-cyber-amber border-cyber-amber' :
                                    'bg-white/20 border-white/40'
                                }`}
                            animate={{ scale: greenPercentage > 40 ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 0.3 }}
                        />
                        <span className="text-white/60 text-xs font-mono">
                            {greenPercentage.toFixed(0)}%
                        </span>
                    </div>
                )}

                {/* Green percentage bar (bottom of feed) */}
                {(state === 'TARGETING' || state === 'WAITING_NEXT') && (
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/60">
                        <div
                            className="h-full bg-cyber-green transition-all duration-200"
                            style={{ width: `${Math.min(greenPercentage, 100)}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Status panel */}
            <div className="bg-black/90 border-t border-white/10 p-6 space-y-4">
                {/* Status text */}
                <div className="text-center">
                    <h2 className="text-cyber-cyan text-2xl font-black tracking-wider mb-2">
                        {getStatusText()}
                    </h2>

                    {/* Additional info based on state */}
                    {state === 'WAITING_NEXT' && timeUntilNext !== null && (
                        <p className="text-white/50 text-sm font-mono">
                            Elapsed: {timeUntilNext.toFixed(1)}s
                        </p>
                    )}

                    {state === 'COMPLETE' && detections.length >= 3 && (
                        <div className="mt-4 space-y-2 text-sm">
                            <p className="text-cyber-green">✓ All cycles detected successfully</p>
                            <p className="text-white/60">Redirecting to cockpit...</p>
                        </div>
                    )}

                    {state === 'ERROR' && (
                        <p className="text-cyber-red text-sm mt-2">{error}</p>
                    )}

                    {state === 'PERMISSION' && (
                        <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
                            This feature requires access to your device's rear camera to automatically detect when the traffic light turns green.
                        </p>
                    )}
                </div>

                {/* Action button */}
                <div className="flex gap-3">
                    {state === 'PERMISSION' && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={requestCamera}
                            className="flex-1 py-4 bg-cyber-cyan text-black font-black tracking-wider rounded border-2 border-cyber-cyan hover:bg-cyber-cyan/90"
                        >
                            ALLOW CAMERA ACCESS
                        </motion.button>
                    )}

                    {state === 'ERROR' && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setError('');
                                setDetections([]);
                                setState('PERMISSION');
                            }}
                            className="flex-1 py-4 bg-cyber-amber text-black font-black tracking-wider rounded border-2 border-cyber-amber"
                        >
                            RETRY
                        </motion.button>
                    )}

                    {state !== 'COMPLETE' && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                stopCamera();
                                onCancel();
                            }}
                            className="px-8 py-4 bg-transparent text-white/60 font-bold tracking-wider rounded border border-white/20 hover:border-cyber-red hover:text-cyber-red"
                        >
                            CANCEL
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
