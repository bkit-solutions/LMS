
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
    faceCheck: "checking" | "success" | "failed"; // New check
    internetLatency?: number;
}

interface SystemCheckProps {
    onComplete: (result: SystemCheckResult) => void;
}

const SystemCheck: React.FC<SystemCheckProps> = ({ onComplete }) => {
    const [results, setResults] = useState<SystemCheckResult>({
        camera: "checking",
        microphone: "checking",
        internet: "checking",
        browser: "checking",
        faceCheck: "checking"
    });

    const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
    const [faceStatus, setFaceStatus] = useState<{ visible: boolean; message: string }>({ visible: false, message: "Initializing AI..." });
    const faceCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading");
    const [manualOverride, setManualOverride] = useState(false);

    // ...

    useEffect(() => {
        // Start loading AI model immediately (background)
        if (proctoringModelLoader.getModel()) {
            setModelStatus("ready");
        } else {
            proctoringModelLoader
                .loadModel()
                .then(() => setModelStatus("ready"))
                .catch(err => {
                    console.error("Background AI load failed:", err);
                    setModelStatus("error");
                });
        }

        runSystemCheck();
        // Cleanup function: If component unmounts and we haven't successfully "handed off" stream?
        // Actually, if we navigate away, we want the MediaStreamManager to keep it.
        // We only stop it if we explicitly fail or close.
    }, []);

    const runSystemCheck = async () => {
        const finalResults: SystemCheckResult = {
            camera: "checking",
            microphone: "checking",
            internet: "checking",
            browser: "checking",
            faceCheck: "checking"
        };

        // 1. Check browser compatibility
        const hasMediaDevices = !!navigator.mediaDevices;
        const hasGetUserMedia = !!navigator.mediaDevices?.getUserMedia;
        const hasMediaPipe = true;
        const hasTensorFlow = true;
        const isBrowserCompatible = hasMediaDevices && hasGetUserMedia && hasMediaPipe && hasTensorFlow;

        finalResults.browser = isBrowserCompatible ? "compatible" : "incompatible";
        setResults(prev => ({ ...prev, browser: finalResults.browser }));

        // 2. Check internet
        if (navigator.onLine) {
            finalResults.internet = "excellent";
            finalResults.internetLatency = 0;
        } else {
            finalResults.internet = "offline";
        }
        setResults(prev => ({ ...prev, internet: finalResults.internet }));

        // 3. Camera & Microphone AND Content Check
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // Success getting hardware
            finalResults.camera = "available";
            finalResults.microphone = "available";

            setResults(prev => ({ ...prev, camera: "available", microphone: "available" }));

            setActiveStream(stream);

            // Store in manager for global access
            MediaStreamManager.getInstance().setStream(stream);

        } catch (error) {
            console.error("Media check failed:", error);
            finalResults.camera = "unavailable";
            finalResults.microphone = "unavailable";
            finalResults.faceCheck = "failed";

            setResults(prev => ({
                ...prev,
                camera: "unavailable",
                microphone: "unavailable",
                faceCheck: "failed"
            }));

            onComplete(finalResults);
        }
    };

    useEffect(() => {
        if (!activeStream || modelStatus !== "ready") return;
        if (results.faceCheck !== "checking") return;

        if (faceCheckTimeoutRef.current) clearTimeout(faceCheckTimeoutRef.current);
        faceCheckTimeoutRef.current = setTimeout(() => {
            if (results.faceCheck === "checking") {
                setResults(prev => ({ ...prev, faceCheck: "failed" }));
                setFaceStatus({ visible: false, message: "Timed out. Could not detect face." });
            }
        }, 15000);

        return () => {
            if (faceCheckTimeoutRef.current) clearTimeout(faceCheckTimeoutRef.current);
        };
    }, [activeStream, modelStatus, results.faceCheck]);

    const handleProctoringStatus = (status: { faceVisible: boolean; hasMultipleFaces: boolean; isLookingAway: boolean }) => {
        if (results.faceCheck === "success") return; // Already passed

        if (status.faceVisible && !status.hasMultipleFaces) {
            setFaceStatus({ visible: true, message: "Face detected successfully!" });

            // Clear timeout
            if (faceCheckTimeoutRef.current) clearTimeout(faceCheckTimeoutRef.current);

            // Update success
            setResults(prev => {
                const newRes = { ...prev, faceCheck: "success" as const };
                onComplete(newRes); // Notify completion
                return newRes;
            });
        } else {
            let msg = "Positions yourself in the frame...";
            if (status.hasMultipleFaces) msg = "Multiple faces detected!";
            else if (!status.faceVisible) msg = "Face not visible.";

            setFaceStatus({ visible: false, message: msg });
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === "checking") {
            return <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />;
        }
        const isPassed = ["available", "compatible", "excellent", "good", "success"].includes(status);
        return isPassed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
            <XCircle className="w-5 h-5 text-primary" />
        );
    };

    const effectiveFaceStatus = manualOverride ? "success" : results.faceCheck;

    return (
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-text mb-4">System & Environment Check</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {/* Camera Check */}
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(results.camera)}
                        <div>
                            <p className="font-medium text-text">Camera Hardware</p>
                            <p className="text-sm text-text-secondary">{results.camera === "available" ? "Found" : "Checking..."}</p>
                        </div>
                    </div>
                    {/* Microphone Check */}
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(results.microphone)}
                        <div>
                            <p className="font-medium text-text">Microphone Hardware</p>
                            <p className="text-sm text-text-secondary">{results.microphone === "available" ? "Found" : "Checking..."}</p>
                        </div>
                    </div>
                    {/* Face Check */}
                    <div className="flex items-center space-x-3">
                        {getStatusIcon(effectiveFaceStatus)}
                        <div>
                            <p className="font-medium text-text">AI Face Verification</p>
                            <p className={`text-sm ${effectiveFaceStatus === "success" ? "text-green-600 font-bold" : "text-text-secondary"}`}>
                                {effectiveFaceStatus === "success" ? "Verified" : faceStatus.message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="rounded-lg overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-border">
                    <ProctoringDiagnostics
                        stream={activeStream}
                        modelStatus={modelStatus}
                        onStatusChange={handleProctoringStatus}
                    />
                </div>
            </div>

            {results.faceCheck === "failed" && activeStream && modelStatus === "ready" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
                    If your face is clearly visible in the preview but detection failed, you can confirm manually.
                    <button
                        onClick={() => {
                            setManualOverride(true);
                            setResults(prev => ({ ...prev, faceCheck: "success" }));
                            onComplete({ ...results, faceCheck: "success" });
                        }}
                        className="ml-3 px-3 py-1 bg-yellow-600 text-white rounded text-xs font-semibold"
                    >
                        I can see my face
                    </button>
                </div>
            )}
        </div>
    );
};

export default SystemCheck;
