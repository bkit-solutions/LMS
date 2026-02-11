import React, { useState, useEffect } from "react";
import { X, Loader2, Video, AlertTriangle, Monitor, MousePointer } from "lucide-react";
import { testApi } from "../../../services/testApi";
import type { SessionReport } from "../../../types";

interface SessionReportModalProps {
    attemptId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

const SessionReportModal: React.FC<SessionReportModalProps> = ({ attemptId, isOpen, onClose }) => {
    const [report, setReport] = useState<SessionReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && attemptId) {
            setLoading(true);
            setError(null);
            testApi.getSessionReport(attemptId)
                .then(response => {
                    if (response.success && response.data) {
                        setReport(response.data);
                    } else {
                        // If no report exists (e.g. non-proctored test), that's fine, just show empty or message
                        setReport(null);
                        if (response.message !== "Session report not found") { // backend might return 404
                            setError(response.message || "No report available");
                        }
                    }
                })
                .catch(err => {
                    // 404 is expected for non-proctored tests
                    setReport(null);
                    // Only show error if it's not a 404
                    if (err.response?.status !== 404) {
                        setError("Failed to load report");
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setReport(null);
        }
    }, [isOpen, attemptId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-border bg-gray-50 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-text flex items-center">
                        <Video className="w-5 h-5 mr-2 text-primary" />
                        Proctoring Session Report
                    </h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-text-secondary">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                            <p>Loading report details...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-10 text-text-secondary">
                            <AlertTriangle className="w-10 h-10 text-orange-400 mb-3" />
                            <p className="text-center">{error}</p>
                            <p className="text-sm mt-2 text-gray-400">This test attempt may not have been proctored.</p>
                        </div>
                    ) : !report ? (
                        <div className="flex flex-col items-center justify-center py-10 text-text-secondary">
                            <Monitor className="w-10 h-10 text-gray-300 mb-3" />
                            <p>No proctoring data recorded for this attempt.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Validity Badge */}
                            <div className={`p-4 rounded-lg flex items-start space-x-3 ${report.isValidTest !== false ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className={`mt-0.5 ${report.isValidTest !== false ? 'text-green-600' : 'text-red-600'}`}>
                                    {report.isValidTest !== false ? (
                                        <div className="font-bold">✅ Valid Session</div>
                                    ) : (
                                        <div className="font-bold">❌ Invalid Session</div>
                                    )}
                                </div>
                            </div>

                            {report.invalidReason && (
                                <div className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-100 mt-2">
                                    <strong>Reason:</strong> {report.invalidReason}
                                </div>
                            )}

                            {/* Violation Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard label="Heads Turned" value={report.headsTurned} color="text-orange-600" />
                                <StatCard label="Head Tilts" value={report.headTilts} color="text-orange-600" />
                                <StatCard label="Gaze Aways" value={report.lookAways} color="text-blue-600" />
                                <StatCard label="Face Visibility" value={report.faceVisibilityIssues} color="text-red-500" />
                                <StatCard label="Multiple People" value={report.multiplePeople} color="text-purple-600" highlight={report.multiplePeople > 0} />
                                <StatCard label="Mobile Detected" value={report.mobileDetected} color="text-red-600" highlight={report.mobileDetected > 0} />
                                <StatCard label="Audio Incidents" value={report.audioIncidents} color="text-yellow-600" />
                            </div>

                            {/* System Violations Section */}
                            <div className="border-t border-dashed border-border pt-4 mt-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                    <Monitor className="w-3 h-3 mr-1" /> System Events
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <StatCard
                                        label="Tab Switches"
                                        value={report.tabSwitches || 0}
                                        color="text-red-600"
                                        highlight={(report.tabSwitches || 0) > 0}
                                        icon={<MousePointer className="w-3 h-3 mr-1" />}
                                    />
                                    <StatCard
                                        label="Window Leaves"
                                        value={report.windowSwitches || 0}
                                        color="text-red-600"
                                        highlight={(report.windowSwitches || 0) > 0}
                                        icon={<Monitor className="w-3 h-3 mr-1" />}
                                    />
                                </div>
                            </div>

                            <div className="text-xs text-gray-400 italic text-center mt-4">
                                Report ID: {report.id} • Last Updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-border flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color, highlight = false, icon }: { label: string, value: number, color: string, highlight?: boolean, icon?: React.ReactNode }) => (
    <div className={`p-3 rounded-lg border ${highlight ? 'bg-red-50 border-red-200' : 'bg-surface border-border'}`}>
        <div className="text-xs text-text-secondary flex items-center mb-1">
            {icon}
            {label}
        </div>
        <div className={`text-xl font-bold ${value > 0 ? color : 'text-gray-400'}`}>
            {value}
        </div>
    </div>
);

export default SessionReportModal;
