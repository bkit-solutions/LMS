import React, { useState, useEffect } from "react";
import {
    X,
    Loader2,
    Video,
    AlertTriangle,
    Monitor,
    MousePointer
} from "lucide-react";

import { testApi } from "../../../services/testApi";
import type { SessionReport } from "../../../types";

interface SessionReportModalProps {

    attemptId: number | null;
    isOpen: boolean;
    onClose: () => void;

}

const SessionReportModal: React.FC<SessionReportModalProps> = ({
    attemptId,
    isOpen,
    onClose
}) => {

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

                    }
                    else {

                        setReport(null);

                        if (response.message !== "Session report not found") {

                            setError(response.message || "No report available");

                        }

                    }

                })

                .catch(err => {

                    setReport(null);

                    if (err.response?.status !== 404) {

                        setError("Failed to load report");

                    }

                })

                .finally(() => setLoading(false));

        }
        else {

            setReport(null);

        }

    }, [isOpen, attemptId]);



    if (!isOpen) return null;



    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">

            {/* MODAL */}
            <div
                className="rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border"
                style={{
                    background: "var(--card)",
                    borderColor: "var(--border)"
                }}
            >


                {/* HEADER */}
                <div
                    className="px-6 py-4 border-b flex justify-between items-center shrink-0"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)"
                    }}
                >

                    <h3
                        className="text-lg font-bold flex items-center"
                        style={{ color: "var(--text)" }}
                    >
                        <Video
                            className="w-5 h-5 mr-2"
                            style={{ color: "var(--primary)" }}
                        />
                        Proctoring Session Report
                    </h3>


                    <button
                        onClick={onClose}
                        className="transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <X className="w-6 h-6" />
                    </button>

                </div>



                {/* BODY */}
                <div className="p-6 overflow-y-auto">

                    {/* LOADING */}
                    {loading && (

                        <div
                            className="flex flex-col items-center justify-center py-10"
                            style={{ color: "var(--text-secondary)" }}
                        >

                            <Loader2
                                className="w-8 h-8 animate-spin mb-3"
                                style={{ color: "var(--primary)" }}
                            />

                            <p>Loading report details...</p>

                        </div>

                    )}



                    {/* ERROR */}
                    {!loading && error && (

                        <div
                            className="flex flex-col items-center justify-center py-10"
                            style={{ color: "var(--text-secondary)" }}
                        >

                            <AlertTriangle
                                className="w-10 h-10 mb-3"
                                style={{ color: "var(--primary)" }}
                            />

                            <p className="text-center">{error}</p>

                            <p
                                className="text-sm mt-2"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                This test attempt may not have been proctored.
                            </p>

                        </div>

                    )}



                    {/* NO REPORT */}
                    {!loading && !error && !report && (

                        <div
                            className="flex flex-col items-center justify-center py-10"
                            style={{ color: "var(--text-secondary)" }}
                        >

                            <Monitor
                                className="w-10 h-10 mb-3"
                                style={{ color: "var(--border)" }}
                            />

                            <p>No proctoring data recorded for this attempt.</p>

                        </div>

                    )}



                    {/* REPORT */}
                    {!loading && !error && report && (

                        <div className="space-y-6">

                            {/* VALIDITY BADGE */}
                            <div
                                className="p-4 rounded-lg border flex items-start space-x-3"
                                style={{
                                    background: report.isValidTest !== false
                                        ? "rgba(16,185,129,0.1)"
                                        : "rgba(239,68,68,0.1)",
                                    borderColor: report.isValidTest !== false
                                        ? "rgba(16,185,129,0.4)"
                                        : "rgba(239,68,68,0.4)"
                                }}
                            >

                                <div
                                    className="mt-0.5 font-bold"
                                    style={{
                                        color: report.isValidTest !== false
                                            ? "#059669"
                                            : "#DC2626"
                                    }}
                                >

                                    {report.isValidTest !== false
                                        ? "✅ Valid Session"
                                        : "❌ Invalid Session"}

                                </div>

                            </div>



                            {/* INVALID REASON */}
                            {report.invalidReason && (

                                <div
                                    className="text-sm p-3 rounded border"
                                    style={{
                                        background: "var(--primary-soft)",
                                        borderColor: "var(--primary)",
                                        color: "var(--primary)"
                                    }}
                                >
                                    <strong>Reason:</strong> {report.invalidReason}
                                </div>

                            )}



                            {/* VIOLATION GRID */}
                            <div className="grid grid-cols-2 gap-4">

                                <StatCard label="Heads Turned" value={report.headsTurned} />

                                <StatCard label="Head Tilts" value={report.headTilts} />

                                <StatCard label="Gaze Aways" value={report.lookAways} />

                                <StatCard label="Face Visibility" value={report.faceVisibilityIssues} />

                                <StatCard label="Multiple People" value={report.multiplePeople} highlight={report.multiplePeople > 0} />

                                <StatCard label="Mobile Detected" value={report.mobileDetected} highlight={report.mobileDetected > 0} />

                                <StatCard label="Audio Incidents" value={report.audioIncidents} />

                            </div>



                            {/* SYSTEM EVENTS */}
                            <div
                                className="border-t pt-4"
                                style={{ borderColor: "var(--border)" }}
                            >

                                <h4
                                    className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center"
                                    style={{ color: "var(--text-secondary)" }}
                                >

                                    <Monitor className="w-3 h-3 mr-1" />
                                    System Events

                                </h4>


                                <div className="grid grid-cols-2 gap-4">

                                    <StatCard
                                        label="Tab Switches"
                                        value={report.tabSwitches || 0}
                                        highlight={(report.tabSwitches || 0) > 0}
                                        icon={<MousePointer className="w-3 h-3 mr-1" />}
                                    />

                                    <StatCard
                                        label="Window Leaves"
                                        value={report.windowSwitches || 0}
                                        highlight={(report.windowSwitches || 0) > 0}
                                        icon={<Monitor className="w-3 h-3 mr-1" />}
                                    />

                                </div>

                            </div>



                            {/* FOOTNOTE */}
                            <div
                                className="text-xs italic text-center mt-4"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Report ID: {report.id}
                                {" • "}
                                Last Updated: {new Date().toLocaleDateString()}
                            </div>

                        </div>

                    )}

                </div>



                {/* FOOTER */}
                <div
                    className="px-6 py-4 border-t flex justify-end shrink-0"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)"
                    }}
                >

                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                        style={{
                            background: "var(--primary)"
                        }}
                    >
                        Close Report
                    </button>

                </div>

            </div>

        </div>

    );

};



/* STAT CARD */
const StatCard = ({
    label,
    value,
    highlight = false,
    icon
}: {
    label: string,
    value: number,
    highlight?: boolean,
    icon?: React.ReactNode
}) => (

    <div
        className="p-3 rounded-lg border"
        style={{
            background: highlight
                ? "rgba(239,68,68,0.08)"
                : "var(--surface)",
            borderColor: highlight
                ? "rgba(239,68,68,0.3)"
                : "var(--border)"
        }}
    >

        <div
            className="text-xs flex items-center mb-1"
            style={{ color: "var(--text-secondary)" }}
        >
            {icon}
            {label}
        </div>


        <div
            className="text-xl font-bold"
            style={{
                color: value > 0
                    ? "var(--primary)"
                    : "var(--text-secondary)"
            }}
        >
            {value}
        </div>

    </div>

);

export default SessionReportModal;
