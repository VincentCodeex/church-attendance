import React from 'react';

interface ParishCrestProps {
    className?: string;
    size?: number;
    showGlow?: boolean;
    alt?: string;
}

export const ParishCrest: React.FC<ParishCrestProps> = ({
    className = 'size-12',
    size,
    showGlow = false,
    alt = 'Our Lady of Fatima Parish Seal',
}) => {
    return (
        <div
            className={`relative inline-flex items-center justify-center rounded-full select-none shrink-0 ${
                showGlow ? 'ring-4 ring-[#22a6df]/40 shadow-lg shadow-[#340299]/30' : ''
            } ${className}`}
            style={size ? { width: size, height: size } : undefined}
        >
            <img
                src="/images/fatima-parish-logo.png"
                alt={alt}
                className="w-full h-full object-contain rounded-full drop-shadow-sm"
                loading="eager"
            />
        </div>
    );
};

export default ParishCrest;
