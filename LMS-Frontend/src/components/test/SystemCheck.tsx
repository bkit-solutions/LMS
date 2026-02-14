import React, { useEffect, useState, useRef } from "react";
import ProctoringDiagnostics from "../proctoring/ProctoringDiagnostics";
import { MediaStreamManager } from "../../utils/MediaStreamManager";
import { proctoringModelLoader } from "../../utils/ProctoringModelLoader";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface SystemCheckResult {
    camera: "checking" | "available" | "unavailable";
    microphone: "checking" | "available" | "unavailable";
    internet: "checking" | "excellent" | "good" | "fair" | "poor" | "offline";
    browser: "checking" | "compatible" | "incompatible";
    faceCheck: "checking" | "success" | "failed";
    internetLatency?: number;
}

interface SystemCheckProps {
    onComplete: (result: SystemCheckResult) => void;
}

const SystemCheck: React.FC<SystemCheckProps> = ({ onComplete }) => {

    const [results, setResults] =
        useState<SystemCheckResult>({
            camera: "checking",
            microphone: "checking",
            internet: "checking",
            browser: "checking",
            faceCheck: "checking"
        });

    const [activeStream, setActiveStream] =
        useState<MediaStream | null>(null);

    const [faceStatus, setFaceStatus] =
        useState({
            visible: false,
            message: "Initializing AI..."
        });

    const faceCheckTimeoutRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const [modelStatus, setModelStatus] =
        useState<"loading" | "ready" | "error">("loading");

    const [manualOverride, setManualOverride] =
        useState(false);



    /* MODEL LOAD */

    useEffect(() => {

        if (proctoringModelLoader.getModel()) {

            setModelStatus("ready");

        } else {

            proctoringModelLoader
                .loadModel()
                .then(() =>
                    setModelStatus("ready"))
                .catch(err => {

                    console.error(err);
                    setModelStatus("error");

                });

        }

        runSystemCheck();

    }, []);



    /* SYSTEM CHECK */

    const runSystemCheck = async () => {

        const finalResults: SystemCheckResult = {
            camera: "checking",
            microphone: "checking",
            internet: "checking",
            browser: "checking",
            faceCheck: "checking"
        };



        /* BROWSER */

        const isBrowserCompatible =
            !!navigator.mediaDevices?.getUserMedia;

        finalResults.browser =
            isBrowserCompatible
                ? "compatible"
                : "incompatible";

        setResults(prev => ({
            ...prev,
            browser: finalResults.browser
        }));



        /* INTERNET */

        if (navigator.onLine) {

            finalResults.internet =
                "excellent";

        } else {

            finalResults.internet =
                "offline";

        }

        setResults(prev => ({
            ...prev,
            internet: finalResults.internet
        }));



        /* CAMERA */

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

            finalResults.camera =
                "available";

            finalResults.microphone =
                "available";

            setResults(prev => ({
                ...prev,
                camera: "available",
                microphone: "available"
            }));

            setActiveStream(stream);

            MediaStreamManager
                .getInstance()
                .setStream(stream);

        } catch {

            finalResults.camera =
                "unavailable";

            finalResults.microphone =
                "unavailable";

            finalResults.faceCheck =
                "failed";

            setResults(prev => ({
                ...prev,
                camera: "unavailable",
                microphone: "unavailable",
                faceCheck: "failed"
            }));

            onComplete(finalResults);

        }

    };



    /* FACE TIMEOUT */

    useEffect(() => {

        if (!activeStream ||
            modelStatus !== "ready" ||
            results.faceCheck !== "checking")
            return;

        faceCheckTimeoutRef.current =
            setTimeout(() => {

                setResults(prev => ({
                    ...prev,
                    faceCheck: "failed"
                }));

                setFaceStatus({
                    visible: false,
                    message:
                        "Face detection timed out"
                });

            }, 15000);

        return () => {

            if (faceCheckTimeoutRef.current)
                clearTimeout(
                    faceCheckTimeoutRef.current
                );

        };

    }, [
        activeStream,
        modelStatus,
        results.faceCheck
    ]);



    /* FACE STATUS */

    const handleProctoringStatus =
        (status: {
            faceVisible: boolean;
            hasMultipleFaces: boolean;
            isLookingAway: boolean;
        }) => {

            if (results.faceCheck === "success")
                return;

            if (status.faceVisible &&
                !status.hasMultipleFaces) {

                setFaceStatus({
                    visible: true,
                    message:
                        "Face verified successfully"
                });

                if (faceCheckTimeoutRef.current)
                    clearTimeout(
                        faceCheckTimeoutRef.current
                    );

                setResults(prev => {

                    const updated = {
                        ...prev,
                        faceCheck: "success" as const
                    };

                    onComplete(updated);

                    return updated;

                });

            } else {

                setFaceStatus({
                    visible: false,
                    message:
                        status.hasMultipleFaces
                            ? "Multiple faces detected"
                            : "Face not visible"
                });

            }

        };



    /* ICON */

    const getStatusIcon =
        (status: string) => {

            if (status === "checking")
                return (
                    <Loader2
                        className="w-5 h-5 animate-spin"
                        style={{
                            color:
                                "var(--text-secondary)"
                        }}
                    />
                );

            const pass =
                ["available",
                    "compatible",
                    "excellent",
                    "success"]
                    .includes(status);

            return pass
                ? (
                    <CheckCircle2
                        className="w-5 h-5"
                        style={{
                            color:
                                "var(--primary)"
                        }}
                    />
                )
                : (
                    <XCircle
                        className="w-5 h-5"
                        style={{
                            color:
                                "var(--accent)"
                        }}
                    />
                );

        };



    const effectiveFaceStatus =
        manualOverride
            ? "success"
            : results.faceCheck;



    return (

        <div
            className="rounded-lg border p-6 space-y-4"
            style={{
                background:
                    "var(--card)",
                borderColor:
                    "var(--border)"
            }}
        >

            <h3
                className="text-lg font-semibold mb-4"
                style={{
                    color:
                        "var(--text)"
                }}
            >
                System & Environment Check
            </h3>



            <div className="grid md:grid-cols-2 gap-6">

                {/* LEFT */}

                <div className="space-y-4">

                    {/* CAMERA */}

                    <div className="flex gap-3">

                        {getStatusIcon(
                            results.camera
                        )}

                        <div>

                            <p
                                className="font-medium"
                                style={{
                                    color:
                                        "var(--text)"
                                }}
                            >
                                Camera Hardware
                            </p>

                            <p
                                className="text-sm"
                                style={{
                                    color:
                                        "var(--text-secondary)"
                                }}
                            >
                                {results.camera === "available"
                                    ? "Detected"
                                    : "Checking"}
                            </p>

                        </div>

                    </div>



                    {/* MICROPHONE */}

                    <div className="flex gap-3">

                        {getStatusIcon(
                            results.microphone
                        )}

                        <div>

                            <p
                                className="font-medium"
                                style={{
                                    color:
                                        "var(--text)"
                                }}
                            >
                                Microphone Hardware
                            </p>

                            <p
                                className="text-sm"
                                style={{
                                    color:
                                        "var(--text-secondary)"
                                }}
                            >
                                {results.microphone === "available"
                                    ? "Detected"
                                    : "Checking"}
                            </p>

                        </div>

                    </div>



                    {/* FACE */}

                    <div className="flex gap-3">

                        {getStatusIcon(
                            effectiveFaceStatus
                        )}

                        <div>

                            <p
                                className="font-medium"
                                style={{
                                    color:
                                        "var(--text)"
                                }}
                            >
                                AI Face Verification
                            </p>

                            <p
                                className="text-sm font-semibold"
                                style={{
                                    color:
                                        effectiveFaceStatus === "success"
                                            ? "var(--primary)"
                                            : "var(--text-secondary)"
                                }}
                            >
                                {effectiveFaceStatus === "success"
                                    ? "Verified"
                                    : faceStatus.message}
                            </p>

                        </div>

                    </div>

                </div>



                {/* PREVIEW */}

                <div
                    className="rounded-lg overflow-hidden aspect-video flex items-center justify-center border"
                    style={{
                        background:
                            "var(--surface)",
                        borderColor:
                            "var(--border)"
                    }}
                >

                    <ProctoringDiagnostics
                        stream={activeStream}
                        modelStatus={modelStatus}
                        onStatusChange={handleProctoringStatus}
                    />

                </div>

            </div>



            {/* MANUAL OVERRIDE */}

            {results.faceCheck === "failed" &&
                activeStream &&
                modelStatus === "ready" && (

                    <div
                        className="rounded-lg p-4 text-sm"
                        style={{
                            background:
                                "var(--primary-soft)",
                            border:
                                "1px solid var(--primary)"
                        }}
                    >

                        Face detection failed. Confirm manually.

                        <button
                            onClick={() => {

                                setManualOverride(true);

                                const updated = {
                                    ...results,
                                    faceCheck: "success" as const
                                };

                                setResults(updated);

                                onComplete(updated);

                            }}
                            className="ml-3 px-3 py-1 text-white rounded text-xs font-semibold"
                            style={{
                                background:
                                    "var(--primary)"
                            }}
                        >
                            Confirm Face
                        </button>

                    </div>

                )}

        </div>

    );

};

export default SystemCheck;
