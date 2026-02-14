import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TestTimerProps {
    durationMinutes: number | null;
    onTimeUp: () => void;
    isPaused?: boolean;
}

const TestTimer: React.FC<TestTimerProps> = ({
    durationMinutes,
    onTimeUp,
    isPaused = false
}) => {

    const [secondsRemaining, setSecondsRemaining] =
        useState<number | null>(
            durationMinutes ? durationMinutes * 60 : null
        );

    const [showWarning, setShowWarning] =
        useState(false);



    /* TIMER EFFECT */

    useEffect(() => {

        if (secondsRemaining === null || isPaused)
            return;

        if (secondsRemaining === 300 && !showWarning)
            setShowWarning(true);

        const interval = setInterval(() => {

            setSecondsRemaining(prev => {

                if (prev === null || prev <= 0) {

                    clearInterval(interval);

                    if (prev === 0)
                        onTimeUp();

                    return 0;
                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(interval);

    }, [
        secondsRemaining,
        isPaused,
        onTimeUp,
        showWarning
    ]);



    /* FORMAT */

    const formatTime = (seconds: number) => {

        const hours =
            Math.floor(seconds / 3600);

        const minutes =
            Math.floor((seconds % 3600) / 60);

        const secs =
            seconds % 60;

        if (hours > 0)
            return `${hours
                .toString()
                .padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`;

        return `${minutes
            .toString()
            .padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;

    };



    /* COLORS */

    const getTimerColor = () => {

        if (secondsRemaining === null)
            return "var(--primary)";

        if (secondsRemaining <= 300)
            return "var(--primary)";

        if (secondsRemaining <= 600)
            return "var(--accent)";

        return "var(--primary)";

    };



    const getProgressPercentage = () => {

        if (!durationMinutes || secondsRemaining === null)
            return 100;

        const total =
            durationMinutes * 60;

        return (
            (secondsRemaining / total) * 100
        );

    };



    /* UNLIMITED */

    if (secondsRemaining === null)
        return (

            <div className="fixed top-4 right-4 z-50">

                <div
                    className="rounded-xl px-6 py-4 shadow-xl border"
                    style={{
                        background:
                            "var(--card)",
                        borderColor:
                            "var(--border)"
                    }}
                >

                    <div className="flex items-center gap-3">

                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background:
                                    "var(--primary)"
                            }}
                        >

                            <Clock className="w-5 h-5 text-white" />

                        </div>

                        <div>

                            <div
                                className="text-lg font-bold"
                                style={{
                                    color:
                                        "var(--text)"
                                }}
                            >
                                No Time Limit
                            </div>

                            <div
                                className="text-sm"
                                style={{
                                    color:
                                        "var(--text-secondary)"
                                }}
                            >
                                Take your time
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        );



    return (

        <>

            {/* WARNING MODAL */}

            {showWarning &&
                secondsRemaining <= 300 && (

                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        style={{
                            background:
                                "rgba(0,0,0,0.5)"
                        }}
                    >

                        <div
                            className="rounded-xl p-8 shadow-2xl max-w-md"
                            style={{
                                background:
                                    "var(--card)",
                                border:
                                    "1px solid var(--border)"
                            }}
                        >

                            <div className="flex gap-3 mb-4">

                                <AlertTriangle
                                    className="w-8 h-8"
                                    style={{
                                        color:
                                            "var(--primary)"
                                    }}
                                />

                                <h3
                                    className="text-xl font-bold"
                                    style={{
                                        color:
                                            "var(--text)"
                                    }}
                                >
                                    Time Warning
                                </h3>

                            </div>

                            <p
                                className="mb-6"
                                style={{
                                    color:
                                        "var(--text-secondary)"
                                }}
                            >
                                Less than 5 minutes remaining.
                                Please submit soon.
                            </p>

                            <button
                                onClick={() =>
                                    setShowWarning(false)
                                }
                                className="w-full py-2 rounded-lg font-semibold text-white"
                                style={{
                                    background:
                                        "var(--primary)"
                                }}
                            >
                                Understood
                            </button>

                        </div>

                    </div>

                )}



            {/* TIMER */}

            <div className="fixed top-4 right-4 z-40">

                <div
                    className="rounded-xl px-6 py-4 shadow-xl border transition-all"
                    style={{
                        background:
                            "var(--card)",
                        borderColor:
                            "var(--border)"
                    }}
                >

                    <div className="flex items-center gap-3">

                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                                background:
                                    "var(--primary)"
                            }}
                        >

                            <Clock className="w-5 h-5 text-white" />

                        </div>


                        <div>

                            <div
                                className="text-xl font-bold tabular-nums"
                                style={{
                                    color:
                                        getTimerColor()
                                }}
                            >
                                {formatTime(
                                    secondsRemaining
                                )}
                            </div>

                            <div
                                className="text-xs"
                                style={{
                                    color:
                                        "var(--text-secondary)"
                                }}
                            >
                                Time Remaining
                            </div>

                        </div>

                    </div>



                    {/* PROGRESS BAR */}

                    <div
                        className="mt-3 w-full h-2 rounded-full overflow-hidden"
                        style={{
                            background:
                                "var(--surface)"
                        }}
                    >

                        <div
                            className="h-full transition-all duration-1000"
                            style={{
                                width:
                                    `${getProgressPercentage()}%`,
                                background:
                                    "var(--primary)"
                            }}
                        />

                    </div>

                </div>

            </div>

        </>

    );

};

export default TestTimer;
