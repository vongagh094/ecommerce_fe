import {useAuctionCountdown} from "@/hooks/use-countdown";

interface CircularProgressProps {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
                                                               value,
                                                               max,
                                                               size = 120,
                                                               strokeWidth = 8,
                                                               color = "#3b82f6",
                                                               backgroundColor = "#e5e7eb",
                                                               children
                                                           }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-in-out"
                />
            </svg>
            {/* Content in center */}
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

// Main countdown clock component
interface CircularCountdownClockProps {
    auctionStartTime: string;
    auctionEndTime: string;
    size?: number;
    className?: string;
}

const CircularCountdownClock: React.FC<CircularCountdownClockProps> = ({
                                                                           auctionStartTime,
                                                                           auctionEndTime,
                                                                           size = 120,
                                                                           className = ""
                                                                       }) => {
    const { timeLeft, isStarted, isEnded, displayText } = useAuctionCountdown(
        auctionStartTime,
        auctionEndTime
    );

    // Determine which unit to display prominently
    const getPrimaryTimeUnit = () => {
        if (timeLeft.days > 0) {
            return { value: timeLeft.days, max: 30, label: "Days", unit: "d" };
        } else if (timeLeft.hours > 0) {
            return { value: timeLeft.hours, max: 24, label: "Hours", unit: "h" };
        } else if (timeLeft.minutes > 0) {
            return { value: timeLeft.minutes, max: 60, label: "Minutes", unit: "m" };
        } else {
            return { value: timeLeft.seconds, max: 60, label: "Seconds", unit: "s" };
        }
    };

    const primaryUnit = getPrimaryTimeUnit();

    // Color scheme based on status
    const getColorScheme = () => {
        if (isEnded) {
            return {
                progressColor: "#ef4444", // red
                textColor: "text-red-600",
                bgColor: "bg-red-50"
            };
        } else if (isStarted) {
            return {
                progressColor: "#f59e0b", // amber
                textColor: "text-amber-600",
                bgColor: "bg-amber-50"
            };
        } else {
            return {
                progressColor: "#3b82f6", // blue
                textColor: "text-blue-600",
                bgColor: "bg-blue-50"
            };
        }
    };

    const colors = getColorScheme();

    return (
        <div className={`inline-flex flex-col items-center space-y-2 ${className}`}>
            {/* Status text */}
            <div className={`text-sm font-medium ${colors.textColor}`}>
                {displayText}
            </div>

            {/* Circular progress */}
            <div className={`p-3 rounded-full ${colors.bgColor}`}>
                <CircularProgress
                    value={primaryUnit.value}
                    max={primaryUnit.max}
                    size={size}
                    strokeWidth={8}
                    color={colors.progressColor}
                    backgroundColor="#e5e7eb"
                >
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${colors.textColor}`}>
                            {primaryUnit.value.toString().padStart(2, '0')}
                        </div>
                        <div className={`text-xs ${colors.textColor} opacity-70`}>
                            {primaryUnit.label}
                        </div>
                    </div>
                </CircularProgress>
            </div>

            {/* Detailed time breakdown */}
            {!isEnded && (
                <div className="flex space-x-4 text-xs text-gray-600">
                    {timeLeft.days > 0 && (
                        <span className="flex flex-col items-center">
                            <span className="font-semibold">{timeLeft.days}</span>
                            <span>days</span>
                        </span>
                    )}
                    <span className="flex flex-col items-center">
                        <span className="font-semibold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                        <span>hrs</span>
                    </span>
                    <span className="flex flex-col items-center">
                        <span className="font-semibold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                        <span>min</span>
                    </span>
                    <span className="flex flex-col items-center">
                        <span className="font-semibold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                        <span>sec</span>
                    </span>
                </div>
            )}
        </div>
    );
};

// Demo component
const Demo = () => {
    // Example auction times (adjust these for testing)
    const now = new Date();
    const startTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Circular Countdown Clock
                    </h1>
                    <p className="text-gray-600">
                        Beautiful circular countdown timer for auctions
                    </p>
                </div>

                {/* Different sizes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4">Small (80px)</h3>
                        <CircularCountdownClock
                            auctionStartTime={startTime.toISOString()}
                            auctionEndTime={endTime.toISOString()}
                            size={80}
                        />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4">Medium (120px)</h3>
                        <CircularCountdownClock
                            auctionStartTime={startTime.toISOString()}
                            auctionEndTime={endTime.toISOString()}
                            size={120}
                        />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4">Large (160px)</h3>
                        <CircularCountdownClock
                            auctionStartTime={startTime.toISOString()}
                            auctionEndTime={endTime.toISOString()}
                            size={160}
                        />
                    </div>
                </div>

                {/* Different states demo */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-center">Different States</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
                        {/* Not started */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-4">Not Started</h3>
                            <CircularCountdownClock
                                auctionStartTime={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
                                auctionEndTime={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()}
                                size={120}
                            />
                        </div>

                        {/* Active */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-4">Active</h3>
                            <CircularCountdownClock
                                auctionStartTime={new Date(Date.now() - 30 * 60 * 1000).toISOString()}
                                auctionEndTime={new Date(Date.now() + 30 * 60 * 1000).toISOString()}
                                size={120}
                            />
                        </div>

                        {/* Ended */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-4">Ended</h3>
                            <CircularCountdownClock
                                auctionStartTime={new Date(Date.now() - 60 * 60 * 1000).toISOString()}
                                auctionEndTime={new Date(Date.now() - 30 * 60 * 1000).toISOString()}
                                size={120}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

