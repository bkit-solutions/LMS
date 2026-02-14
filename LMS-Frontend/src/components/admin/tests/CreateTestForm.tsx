import React, { useState, useEffect } from "react";
import { FileText, AlertCircle, Loader2, Check, Eye, Shield, TrendingUp, BookOpen } from "lucide-react";
import { testApi } from "../../../services/testApi";
import { useCollegeTheme } from "../../../hooks/useCollegeTheme";
import type { CreateTestRequest } from "../../../types";

interface CreateTestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateTestForm: React.FC<CreateTestFormProps> = ({ onSuccess, onCancel }) => {
  const { applyTheme } = useCollegeTheme();
  const [formData, setFormData] = useState<CreateTestRequest>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    totalMarks: 0,
    published: false,
    maxAttempts: 1,
    proctored: false,
    durationMinutes: undefined,
    instructions: "",
    passingPercentage: 40,
    difficultyLevel: "MEDIUM",
    showResultsImmediately: false,
    allowReview: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await testApi.createTest(formData);
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? undefined : Number(value)) : type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <div
  className="px-6 py-5 border-b flex-shrink-0"
  style={{
    background: "var(--primary)",
    borderColor: "var(--border)",
  }}
>
  <div className="flex items-center space-x-3">

    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center"
      style={{
        background: "var(--card)",
      }}
    >
      <FileText
        className="w-6 h-6"
        style={{
          color: "var(--primary)",
        }}
      />
    </div>

    <div>

      <h2
        className="text-xl font-bold"
        style={{
          color: "var(--primary-foreground)",
        }}
      >
        Create New Test
      </h2>

      <p
        className="text-sm"
        style={{
          color: "var(--primary-foreground)",
          opacity: 0.8,
        }}
      >
        Design your assessment with custom settings
      </p>

    </div>

  </div>
</div>


      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Form Inputs */}
        <div className="flex-1 overflow-y-auto p-6 lg:max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Test Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter test title"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Provide test description and instructions"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Start Time <span className="text-primary">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  End Time <span className="text-primary">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes || ""}
                  onChange={handleChange}
                  min="1"
                  placeholder="Unlimited"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Total Marks <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleChange}
                  min="0"
                  required
                  placeholder="100"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Passing %
                </label>
                <input
                  type="number"
                  name="passingPercentage"
                  value={formData.passingPercentage || ""}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="40"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Difficulty
                </label>
                <select
                  name="difficultyLevel"
                  value={formData.difficultyLevel || "MEDIUM"}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Max Attempts <span className="text-primary">*</span>
              </label>
              <input
                type="number"
                name="maxAttempts"
                value={formData.maxAttempts}
                onChange={handleChange}
                min="1"
                required
                placeholder="1"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Detailed test instructions"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center p-4 bg-surface rounded-lg border border-border">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary focus:ring-primary border-border rounded"
                />
                <div className="ml-3">
                  <label className="block text-sm font-semibold text-text">
                    Publish Immediately
                  </label>
                  <p className="text-xs text-text-secondary">Make test available to students</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  name="proctored"
                  checked={formData.proctored}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <div className="ml-3">
                  <label className="block text-sm font-semibold text-blue-900">
                    Enable Proctoring
                  </label>
                  <p className="text-xs text-blue-700">AI monitoring for cheating detection</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                <input
                  type="checkbox"
                  name="showResultsImmediately"
                  checked={formData.showResultsImmediately}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 focus:ring-green-500 border-border rounded"
                />
                <div className="ml-3">
                  <label className="block text-sm font-semibold text-green-900">
                    Show Results Immediately
                  </label>
                  <p className="text-xs text-green-700">Display results after submission</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  name="allowReview"
                  checked={formData.allowReview}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-border rounded"
                />
                <div className="ml-3">
                  <label className="block text-sm font-semibold text-purple-900">
                    Allow Review
                  </label>
                  <p className="text-xs text-purple-700">Students can review answers after submission</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-primary font-medium">{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-sm font-semibold text-text-secondary bg-surface hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-secondary rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Create Test</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Live Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye
  className="w-5 h-5 mr-2"
  style={{ color: "var(--primary)" }}
/>

              Live Preview
            </h3>
            <p className="text-sm text-gray-600 mt-1">See how your test will appear to students</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
            {/* Test Header Preview */}
            <div
  className="px-6 py-4 border-b"
  style={{
    background: "var(--primary)",
    borderColor: "var(--border)",
  }}
>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {formData.title || "Test Title"}
                  </h1>
                  <p className="text-red-100 text-sm mt-1">
                    {formData.description || "Test description will appear here"}
                  </p>
                </div>
                <div className="text-right text-white">
                  <div className="text-sm opacity-90">Total Marks</div>
                  <div className="text-2xl font-bold">{formData.totalMarks || 0}</div>
                </div>
              </div>
            </div>

            {/* Test Info Preview */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Duration:</span>
                  <span className="font-medium">
                    {formData.durationMinutes ? `${formData.durationMinutes} min` : "Unlimited"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Attempts:</span>
                  <span className="font-medium">{formData.maxAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Difficulty:</span>
                  <span className="font-medium">{formData.difficultyLevel || "MEDIUM"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Passing:</span>
                  <span className="font-medium">{formData.passingPercentage || 40}%</span>
                </div>
              </div>

              {/* Instructions Preview */}
              {formData.instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions</h4>
                  <p className="text-sm text-blue-800">{formData.instructions}</p>
                </div>
              )}

              {/* Settings Preview */}
              <div className="space-y-2">
                {formData.published && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4" />
                    <span>Test will be published immediately</span>
                  </div>
                )}
                {formData.proctored && (
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Shield className="w-4 h-4" />
                    <span>Proctoring enabled (AI monitoring)</span>
                  </div>
                )}
                {formData.showResultsImmediately && (
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <TrendingUp className="w-4 h-4" />
                    <span>Results shown immediately after submission</span>
                  </div>
                )}
                {formData.allowReview && (
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <BookOpen className="w-4 h-4" />
                    <span>Review allowed after submission</span>
                  </div>
                )}
              </div>

              {/* Sample Question Preview */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-text mb-3">Sample Question Preview</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span
  className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold"
  style={{
    background: "var(--primary)",
  }}
>
  1
</span>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-text">Sample multiple choice question?</p>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <input type="radio" name="sample" className="text-primary" />
                            <span className="text-sm">Option A</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="radio" name="sample" className="text-primary" />
                            <span className="text-sm">Option B</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="radio" name="sample" className="text-primary" />
                            <span className="text-sm">Option C</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="radio" name="sample" className="text-primary" />
                            <span className="text-sm">Option D</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTestForm;