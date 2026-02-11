import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { testApi } from "../../../services/testApi";
import type { Test, UpdateTestRequest } from "../../../types";

interface EditTestModalProps {
    test: Test;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedTest: Test) => void;
}

const EditTestModal: React.FC<EditTestModalProps> = ({ test, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<UpdateTestRequest>({
        title: test.title,
        description: test.description,
        startTime: test.startTime,
        endTime: test.endTime,
        totalMarks: test.totalMarks,
        maxAttempts: test.maxAttempts,
        proctored: test.proctored,
        durationMinutes: test.durationMinutes,
        instructions: test.instructions,
        passingPercentage: test.passingPercentage,
        difficultyLevel: test.difficultyLevel,
        showResultsImmediately: test.showResultsImmediately,
        allowReview: test.allowReview,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: test.title,
                description: test.description,
                startTime: test.startTime,
                endTime: test.endTime,
                totalMarks: test.totalMarks,
                maxAttempts: test.maxAttempts,
                proctored: test.proctored,
                durationMinutes: test.durationMinutes,
                instructions: test.instructions,
                passingPercentage: test.passingPercentage,
                difficultyLevel: test.difficultyLevel,
                showResultsImmediately: test.showResultsImmediately,
                allowReview: test.allowReview,
            });
            setError(null);
        }
    }, [isOpen, test]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await testApi.updateTest(test.id, formData);
            if (response.success && response.data) {
                onSuccess(response.data);
                onClose();
            } else {
                setError(response.message || "Failed to update test");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update test");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? undefined : Number(value)) : type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-border bg-gray-50 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-text">Edit Test Details</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto flex-grow custom-scrollbar">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ""}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime || ""}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">End Time</label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime || ""}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Total Marks</label>
                                <input
                                    type="number"
                                    name="totalMarks"
                                    value={formData.totalMarks || 0}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    name="durationMinutes"
                                    value={formData.durationMinutes || ""}
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Unlimited"
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Passing Percentage</label>
                                <input
                                    type="number"
                                    name="passingPercentage"
                                    value={formData.passingPercentage || ""}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    placeholder="40"
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Difficulty Level</label>
                                <select
                                    name="difficultyLevel"
                                    value={formData.difficultyLevel || "MEDIUM"}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white transition-all"
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Max Attempts</label>
                            <input
                                type="number"
                                name="maxAttempts"
                                value={formData.maxAttempts || 1}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Detailed Instructions</label>
                            <textarea
                                name="instructions"
                                value={formData.instructions || ""}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Test instructions, rules, and guidelines"
                                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                                <input
                                    type="checkbox"
                                    name="proctored"
                                    checked={formData.proctored || false}
                                    onChange={handleChange}
                                    className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-semibold text-blue-900">
                                        Enable Proctoring (AI Monitoring)
                                    </span>
                                    <span className="block text-xs text-blue-700 mt-0.5">
                                        Students will be monitored with camera/audio for cheating detection
                                    </span>
                                </div>
                            </label>

                            <label className="flex items-start p-4 bg-green-50 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-colors">
                                <input
                                    type="checkbox"
                                    name="showResultsImmediately"
                                    checked={formData.showResultsImmediately || false}
                                    onChange={handleChange}
                                    className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-semibold text-green-900">
                                        Show Results Immediately
                                    </span>
                                    <span className="block text-xs text-green-700 mt-0.5">
                                        Display test results to students as soon as they submit
                                    </span>
                                </div>
                            </label>

                            <label className="flex items-start p-4 bg-purple-50 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors">
                                <input
                                    type="checkbox"
                                    name="allowReview"
                                    checked={formData.allowReview || false}
                                    onChange={handleChange}
                                    className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-all"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-semibold text-purple-900">
                                        Allow Review After Submission
                                    </span>
                                    <span className="block text-xs text-purple-700 mt-0.5">
                                        Students can review their answers and correct answers after submission
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 px-6 py-4 border-t border-border bg-gray-50 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-text-secondary bg-white border border-border hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:hover:translate-y-0 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTestModal;
