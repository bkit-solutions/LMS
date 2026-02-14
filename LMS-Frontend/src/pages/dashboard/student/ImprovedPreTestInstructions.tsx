import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, Video } from "lucide-react";
import SystemCheck from "../../../components/test/SystemCheck";
import { testApi } from "../../../services/testApi";
import type { Test } from "../../../types";
import { proctoringModelLoader } from "../../../utils/ProctoringModelLoader";
import { MediaStreamManager } from "../../../utils/MediaStreamManager";

interface SystemCheckResult {
    camera: "checking" | "available" | "unavailable";
    microphone: "checking" | "available" | "unavailable";
    internet: "checking" | "excellent" | "good" | "fair" | "poor" | "offline";
    browser: "checking" | "compatible" | "incompatible";
    faceCheck: "checking" | "success" | "failed";
    internetLatency?: number;
}

const ImprovedPreTestInstructions: React.FC = () => {
    const { collegeCode, testId } = useParams<{ collegeCode: string; testId: string }>();
    const navigate = useNavigate();

    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [systemCheckComplete, setSystemCheckComplete] = useState(false);
    const [_systemResults, _setSystemResults] = useState<SystemCheckResult | null>(null);
    const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">("loading");
    const [proctoringStream, setProctoringStream] = useState<MediaStream | null>(null);
    const [_showCameraModal, _setShowCameraModal] = useState(false);
    const [starting, setStarting] = useState(false);
    const [questionCount, setQuestionCount] = useState<number>(0);

    useEffect(() => {
        const fetchTestDetails = async () => {
            if (!testId) return;
            try {
                setLoading(true);
                const response = await testApi.getTest(Number(testId));

                if (response.success && response.data) {
                    const foundTest = response.data;

                    // Fetch question count
                    try {
                        const questionsResponse = await testApi.getQuestions(Number(testId));
                        if (questionsResponse.success && questionsResponse.data) {
                            setQuestionCount(questionsResponse.data.length);
                        }
                    } catch (qErr) {
                        console.error("Failed to fetch question count:", qErr);
                    }
                    setTest(foundTest);
                } else {
                    setError("Test not found or access denied.");
                }
            } catch (err) {
                const status = (err as { response?: { status?: number } })?.response?.status;
                if (status === 401) {
                    localStorage.removeItem("token");
                    navigate("/login", { replace: true });
                    return;
                }

                if (status === 403) {
                    setError("Access denied. You do not have permission to view this test.");
                    return;
                }

                console.error("Failed to fetch test details:", err);
                setError("Failed to load test details.");
            } finally {
                setLoading(false);
            }
        };

        fetchTestDetails();
    }, [testId, navigate]);

    useEffect(() => {
        if (!test || !test.proctored) {
            setModelStatus("ready");
            return;
        }

        let isMounted = true;
        if (proctoringModelLoader.getModel()) {
            setModelStatus("ready");
        } else {
            setModelStatus("loading");
            proctoringModelLoader
                .loadModel()
                .then(() => {
                    if (isMounted) setModelStatus("ready");
                })
                .catch(() => {
                    if (isMounted) setModelStatus("error");
                });
        }

        return () => {
            isMounted = false;
        };
    }, [test]);

    const handleSystemCheckComplete = (results: SystemCheckResult) => {
        console.log("System check completed with results:", results);
        setSystemCheckComplete(true);
        _setSystemResults(results);

        // Retrieve the camera stream from MediaStreamManager (set by SystemCheck)
        const existingStream = MediaStreamManager.getInstance().getStream();
        if (existingStream) {
            console.log("Retrieved camera stream from MediaStreamManager:", existingStream.id);
            setProctoringStream(existingStream);
        } else {
            console.warn("No stream found in MediaStreamManager after system check");
        }
    };

    const requestCameraAccess = async () => {
        console.log("requestCameraAccess called");
        try {
            console.log("Requesting camera and microphone...");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true,
            });

            console.log("Camera stream obtained:", stream.id);
            stream.getTracks().forEach(track => {
                track.onended = () => {
                    console.warn("Stream track ended");
                    setProctoringStream(null);
                };
            });

            setProctoringStream(stream);
            MediaStreamManager.getInstance().setStream(stream);
            _setShowCameraModal(false);
            console.log("Camera initialized successfully");
            return true;
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera and microphone access is required for proctored tests. Please allow access and try again.");
            alert("Camera and microphone access is required for proctored tests. Please allow access in your browser settings and try again.");
            return false;
        }
    };

    const handleStartTest = async () => {
        if (!test || !agreed || !systemCheckComplete) return;

        console.log("handleStartTest called, test:", test);
        setStarting(true);

        // Check if proctored and needs camera
        if (test.proctored && !proctoringStream) {
            console.log("Test is proctored, requesting camera access...");
            const granted = await requestCameraAccess();
            if (!granted) {
                console.error("Camera access denied");
                setStarting(false);
                return;
            }
            console.log("Camera access granted");
        }

        // Enter fullscreen BEFORE starting the test
        console.log("Requesting fullscreen...");
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                console.log("Fullscreen activated");
            }
        } catch (err) {
            console.error("Fullscreen request failed:", err);
            alert("Please allow fullscreen mode to start the test. Click the button again.");
            setStarting(false);
            return;
        }

        // Start attempt
        try {
            console.log("Starting test attempt for testId:", testId);
            const res = await testApi.startAttempt(Number(testId));
            if (res.success && res.data) {
                console.log("Test attempt started successfully:", res.data);
                localStorage.setItem(`activeAttempt_${testId}`, String(res.data.id));
                console.log("Navigating to test page with attempt:", res.data.id);
                navigate(`/${collegeCode}/dashboard/test/take/${testId}`, {
                    state: {
                        attempt: res.data,
                        cameraReady: test.proctored || false,
                        fromInstructions: true
                    },
                    replace: false
                });
            } else {
                console.error("Failed to start test:", res.message);
                throw new Error(res.message || "Failed to start test");
            }
        } catch (err: any) {
            console.error("Failed to start test:", err);
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                localStorage.removeItem("token");
                navigate("/login", { replace: true });
                return;
            }
            const errorMessage = err.response?.data?.message || "Failed to start test";
            setError(errorMessage);
            alert(`Failed to start test: ${errorMessage}`);
        } finally {
            setStarting(false);
        }
    };

    const canStartTest = agreed && (systemCheckComplete || !test?.proctored) && (!test?.proctored || (modelStatus === "ready" && proctoringStream)) && !starting;

    // Debug logging for button state
    useEffect(() => {
        console.log("Button state check:", {
            agreed,
            systemCheckComplete,
            isProctored: test?.proctored,
            modelStatus,
            hasProctoringStream: !!proctoringStream,
            starting,
            canStartTest
        });
    }, [agreed, systemCheckComplete, test?.proctored, modelStatus, proctoringStream, starting, canStartTest]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading test...</p>
                </div>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
                    <div className="text-red-600 mb-4 text-lg font-semibold">{error || "Test not found"}</div>
                    <button
                        onClick={() => navigate(`/${collegeCode}/dashboard`)}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="bg-blue-600 px-6 py-5 text-white">
                        <h1 className="text-2xl font-bold mb-2">{test.title}</h1>
                        <p className="text-blue-100">{test.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gray-50 border-b">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{questionCount}</div>
                            <div className="text-sm text-gray-600">Questions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{test.durationMinutes || '∞'}</div>
                            <div className="text-sm text-gray-600">{test.durationMinutes ? 'Minutes' : 'Unlimited'}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{test.totalMarks || '-'}</div>
                            <div className="text-sm text-gray-600">Total Marks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{test.maxAttempts}</div>
                            <div className="text-sm text-gray-600">Max Attempts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{test.passingPercentage || 'N/A'}%</div>
                            <div className="text-sm text-gray-600">Passing</div>
                        </div>
                    </div>

                    <div className="p-6 space-y-3 border-b">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700"><strong>Available From:</strong> {formatDate(test.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700"><strong>Available Until:</strong> {formatDate(test.endTime)}</span>
                        </div>
                        {test.proctored && (
                            <div className="flex items-center gap-3 text-orange-700 bg-orange-50 p-3 rounded">
                                <Video className="w-5 h-5" />
                                <span className="font-medium">Camera and microphone required</span>
                            </div>
                        )}
                    </div>

                    {test.instructions && (
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900">Special Instructions</h3>
                            <div className="text-gray-700 whitespace-pre-wrap">
                                {test.instructions}
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">General Instructions</h3>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                                <span>Ensure stable internet connection before starting</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                                <span>Test will start when you click "Start Test" button</span>
                            </li>
                            {test.durationMinutes && (
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                                    <span>You have <strong>{test.durationMinutes} minutes</strong> to complete this test</span>
                                </li>
                            )}
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">{test.durationMinutes ? '4' : '3'}</span>
                                <span>Navigate between questions using the question palette</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">{test.durationMinutes ? '5' : '4'}</span>
                                <span>Answers are automatically saved</span>
                            </li>
                            {test.proctored && (
                                <>
                                    <li className="flex items-start gap-3 text-orange-700">
                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-medium">{test.durationMinutes ? '6' : '5'}</span>
                                        <span>Keep your face visible to camera at all times</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-orange-700">
                                        <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-medium">{test.durationMinutes ? '7' : '6'}</span>
                                        <span>Do not switch tabs or minimize window</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {test.proctored && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">System Requirements Check</h3>
                        <SystemCheck onComplete={handleSystemCheckComplete} />
                        {modelStatus === "loading" && (
                            <div className="mt-4 flex items-center gap-3 text-blue-600">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                                <span>Loading proctoring model...</span>
                            </div>
                        )}
                        {modelStatus === "error" && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                                Failed to load proctoring model. Please refresh the page.
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow p-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300"
                        />
                        <span className="text-gray-700">
                            I have read and understood all instructions and agree to follow test rules. I understand that violations may result in test cancellation.
                        </span>
                    </label>

                    <div className="mt-6 flex justify-between items-center">
                        <button
                            onClick={() => navigate(`/${collegeCode}/dashboard`)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStartTest}
                            disabled={!canStartTest}
                            className={`px-8 py-2 rounded font-medium text-white transition-colors ${
                                canStartTest
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                        >
                            {starting ? "Starting..." : test?.proctored ? "Start Test" : "Start Test"}
                        </button>
                    </div>

                    {!systemCheckComplete && test.proctored && (
                        <p className="mt-4 text-sm text-gray-500 text-center">
                            Complete the system check to enable start button
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImprovedPreTestInstructions;
