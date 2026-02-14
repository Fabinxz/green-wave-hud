import { ReactNode } from 'react';

interface GlassPanelProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function GlassPanel({ children, className = '', onClick }: GlassPanelProps) {
    return (
        <div
            className={`glass-panel ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
