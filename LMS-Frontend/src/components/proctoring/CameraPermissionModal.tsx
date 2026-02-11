import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  CheckCircle2,
  Shield,
  Mic,
  Camera,
  AlertCircle,
  Loader2,
  ArrowRight,
  X,
} from "lucide-react";

interface CameraPermissionModalProps {
    onPermissionGranted: (stream: MediaStream) => void;
    onPermissionDenied: () => void;
    onCancel: () => void;
}

const CameraPermissionModal: React.FC<CameraPermissionModalProps> = ({
    onPermissionGranted,
    onPermissionDenied,
    onCancel,
}) => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const requestPermissions = async () => {
        setIsRequesting(true);
        setError(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
                audio: true,
            });

            setStream(mediaStream);

            // Show preview
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err: any) {
            console.error("Permission error:", err);

            let errorMessage = "Failed to access camera and microphone.";

            if (err.name === "NotAllowedError") {
                errorMessage = "Camera/microphone access denied. Please allow access to continue.";
            } else if (err.name === "NotFoundError") {
                errorMessage = "No camera or microphone found. Please connect a camera.";
            } else if (err.name === "NotReadableError") {
                errorMessage = "Camera is already in use by another application.";
            }

            setError(errorMessage);
            onPermissionDenied();
        } finally {
            setIsRequesting(false);
        }
    };

    const streamTransferredRef = useRef(false);

    const handleContinue = () => {
        if (stream) {
            streamTransferredRef.current = true;
            onPermissionGranted(stream);
        }
    };

    const handleCancel = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onCancel();
    };

    useEffect(() => {
        return () => {
            // Cleanup: stop all tracks when component unmounts
            // BUT ONLY if we haven't transferred the stream to the parent
            if (stream && !streamTransferredRef.current) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-primary p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <Video className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Proctoring Required</h2>
                            <p className="text-red-100 text-sm">Camera & Microphone Access Needed</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!stream && !error && (
                        <div className="space-y-4">
                            <div className="bg-surface border border-border rounded-lg p-4">
                                <h3 className="font-semibold text-text mb-2">Why do we need this?</h3>
                                <p className="text-sm text-text-secondary">
                                    This test requires proctoring to ensure academic integrity. We need access to:
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                                    <li className="flex items-start">
                                        <Camera className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                        <span><strong>Camera</strong> - to verify your identity and monitor your test environment</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Mic className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                        <span><strong>Microphone</strong> - to detect suspicious audio activity</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-surface border border-border rounded-lg p-4">
                                <h3 className="font-semibold text-text mb-2 flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                                    Your Privacy is Protected
                                </h3>
                                <p className="text-sm text-text-secondary">
                                    • No video recording - only monitoring data is stored<br />
                                    • All processing happens locally in your browser<br />
                                    • Data is encrypted and visible only to authorized personnel
                                </p>
                            </div>
                        </div>
                    )}

                    {stream && videoRef.current && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-800">Camera and microphone access granted!</span>
                            </div>

                            <div className="relative rounded-lg overflow-hidden bg-black">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-64 object-cover transform scale-x-[-1]"
                                />
                                <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                                    Camera Preview
                                </div>
                            </div>

                            <p className="text-sm text-center text-text-secondary">
                                You can see your camera preview above. Click "Continue to Test" to proceed.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-primary">Permission Error</h3>
                                    <p className="mt-1 text-sm text-red-700">{error}</p>
                                    <button
                                        onClick={requestPermissions}
                                        className="mt-3 text-sm font-medium text-primary hover:text-red-800 underline"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-surface px-6 py-4 flex justify-end space-x-3 border-t border-border">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2.5 border border-border text-text-secondary rounded-lg hover:bg-white font-medium transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" /> Cancel
                    </button>

                    {!stream && !error && (
                        <button
                            onClick={requestPermissions}
                            disabled={isRequesting}
                            className="px-6 py-2.5 bg-primary hover:bg-secondary text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isRequesting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Requesting Access...</span>
                                </>
                            ) : (
                                <>
                                    <Video className="w-5 h-5" />
                                    <span>Grant Access</span>
                                </>
                            )}
                        </button>
                    )}

                    {stream && (
                        <button
                            onClick={handleContinue}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                            <ArrowRight className="w-5 h-5" />
                            <span>Continue to Test</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraPermissionModal;
