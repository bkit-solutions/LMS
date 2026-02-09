import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TestTimerProps {
    durationMinutes: number | null; // null means unlimited time
    onTimeUp: () => void;
    isPaused?: boolean;
}

const TestTimer: React.FC<TestTimerProps> = ({ durationMinutes, onTimeUp, isPaused = false }) => {
    const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
        durationMinutes ? durationMinutes * 60 : null
    );
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        // No timer for unlimited duration
        if (secondsRemaining === null || isPaused) return;

        // Show warning when 5 minutes remaining
        if (secondsRemaining === 300 && !showWarning) {
            setShowWarning(true);
        }

        // Timer countdown
        const interval = setInterval(() => {
            setSecondsRemaining((prev) => {
                if (prev === null || prev <= 0) {
                    clearInterval(interval);
                    if (prev === 0) onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsRemaining, isPaused, onTimeUp, showWarning]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getTimerColor = (): string => {
        if (secondsRemaining === null) return "text-blue-600";
        if (secondsRemaining <= 300) return "text-red-600"; // Last 5 minutes
        if (secondsRemaining <= 600) return "text-orange-600"; // Last 10 minutes
        return "text-green-600";
    };

    const getBackgroundColor = (): string => {
        if (secondsRemaining === null) return "bg-blue-50";
        if (secondsRemaining <= 300) return "bg-red-50";
        if (secondsRemaining <= 600) return "bg-orange-50";
        return "bg-green-50";
    };

    const getProgressPercentage = (): number => {
        if (secondsRemaining === null || !durationMinutes) return 100;
        const totalSeconds = durationMinutes * 60;
        return (secondsRemaining / totalSeconds) * 100;
    };

    if (secondsRemaining === null) {
        return (
            <div className="fixed top-4 right-4 z-50">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-3 shadow-lg">
                    <div className="flex items-center space-x-3">
                        <Clock className="w-6 h-6 text-blue-600" />
                        <div>
                            <div className="text-sm font-medium text-blue-800">Unlimited Time</div>
                            <div className="text-xs text-blue-600">No time restrictions</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Warning Modal */}
            {showWarning && secondsRemaining <= 300 && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
                    <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                            <h3 className="text-xl font-bold text-gray-800">Time Warning</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            You have less than 5 minutes remaining to complete the test. Please review your answers and submit soon.
                        </p>
                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

            {/* Timer Display */}
            <div className="fixed top-4 right-4 z-40">
                <div className={`${getBackgroundColor()} border-2 ${
                    secondsRemaining <= 300 ? "border-red-400" : 
                    secondsRemaining <= 600 ? "border-orange-400" : "border-green-400"
                } rounded-lg px-6 py-3 shadow-lg transition-all duration-300 ${
                    secondsRemaining <= 60 ? "animate-pulse" : ""
                }`}>
                    <div className="flex items-center space-x-3">
                        <Clock className={`w-6 h-6 ${getTimerColor()}`} />
                        <div>
                            <div className={`text-2xl font-bold ${getTimerColor()} tabular-nums`}>
                                {formatTime(secondsRemaining)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                {secondsRemaining <= 60 
                                    ? "Last minute!" 
                                    : secondsRemaining <= 300 
                                    ? "Hurry up!"
                                    : "Time remaining"
                                }
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${
                                secondsRemaining <= 300 ? "bg-red-600" :
                                secondsRemaining <= 600 ? "bg-orange-600" : "bg-green-600"
                            } transition-all duration-1000 ease-linear`}
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TestTimer;
