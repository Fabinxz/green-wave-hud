'use client';

import { useRouter } from 'next/navigation';
import CameraSync from '@/components/CameraSync';
import { useStore } from '@/lib/store';

export default function CameraSyncPage() {
    const router = useRouter();
    const { setCameraSync } = useStore();

    const handleComplete = (result: {
        syncTimestamp: number;
        measuredCycle: number;
        quality: number;
    }) => {
        // Save calibration data to store
        setCameraSync({
            timestamp: result.syncTimestamp,
            method: 'camera-triple',
            quality: result.quality,
            measuredCycle: result.measuredCycle,
        });

        // Navigate back to cockpit
        router.push('/');
    };

    const handleCancel = () => {
        router.push('/settings');
    };

    return <CameraSync onComplete={handleComplete} onCancel={handleCancel} />;
}
