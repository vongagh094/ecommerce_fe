import React, { useState, useEffect, useRef } from 'react';

interface SimpleCountdownTimerProps {
    interval?: number; // Milliseconds (default: 10000 = 10s)
    onTick?: () => void; // Callback mỗi khi đếm ngược về 0
    enabled?: boolean; // Bật/tắt timer
    size?: number;
    className?: string;
}

const SimpleCountdownTimer: React.FC<SimpleCountdownTimerProps> = ({
                                                                       interval = 10000, // 10 giây
                                                                       onTick,
                                                                       enabled = true,
                                                                       size = 80,
                                                                       className = ""
                                                                   }) => {
    const [countdown, setCountdown] = useState(interval / 1000); // Convert to seconds
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Reset countdown khi interval thay đổi
    useEffect(() => {
        setCountdown(interval / 1000);
    }, [interval]);

    // Main timer logic
    useEffect(() => {
        if (!enabled) {
            // Clear timers khi disabled
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            return;
        }

        // Countdown timer (update UI mỗi giây)
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    return interval / 1000; // Reset về interval
                }
                return prev - 1;
            });
        }, 1000);

        // Main interval timer (trigger callback)
        intervalRef.current = setInterval(() => {
            if (onTick) {
                console.log(`⏰ ${interval/1000}s timer triggered - calling callback`);
                onTick();
            }
        }, interval);

        // Cleanup
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [interval, onTick, enabled]);

    // Circular progress calculation
    const radius = (size - 6) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = ((interval / 1000 - countdown) / (interval / 1000)) * 100;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Color based on countdown
    const getColor = () => {
        const percentage = (countdown / (interval / 1000)) * 100;
        if (percentage > 50) return "#10b981"; // green
        if (percentage > 20) return "#f59e0b"; // amber
        return "#ef4444"; // red
    };

    const color = getColor();

    return (
        <div className={`inline-flex items-center space-x-2 ${className}`}>
            {/* Circular countdown - Inline */}
            <div className="p-1 rounded-full bg-gray-50">
                <div className="relative inline-flex items-center justify-center">
                    <svg width={36} height={36} className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx={18}
                            cy={18}
                            r={14}
                            stroke="#e5e7eb"
                            strokeWidth={3}
                            fill="transparent"
                        />
                        {/* Progress circle */}
                        <circle
                            cx={18}
                            cy={18}
                            r={14}
                            stroke={color}
                            strokeWidth={3}
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>

                    {/* Content in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-xs font-bold text-gray-700">
                            {Math.ceil(countdown)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Text label beside */}
            <div className="text-xs text-gray-500">
                Refresh in {Math.ceil(countdown)}s
            </div>
        </div>
    );
};

export default SimpleCountdownTimer;