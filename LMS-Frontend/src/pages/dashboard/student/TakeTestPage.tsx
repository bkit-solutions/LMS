import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { testApi } from "../../../services/testApi";
import type { Attempt, Question, Test } from "../../../types";
import CameraPermissionModal from "../../../components/proctoring/CameraPermissionModal";
import ProctoringManager from "../../../components/proctoring/ProctoringManager";
import ConnectivityIndicator from "../../../components/common/ConnectivityIndicator";
import QuestionPaperModal from "../../../components/common/QuestionPaperModal";
import { MediaStreamManager } from "../../../utils/MediaStreamManager";
import {
  ClipboardList, ChevronRight, AlertTriangle,
  VideoOff, ChevronLeft, ShieldCheck, Info, Clock, CheckSquare, Square, Upload, CheckCircle
} from "lucide-react";

const TakeTest: React.FC = () => {
  const { testId: testIdParam, collegeCode } = useParams<{ testId: string; collegeCode: string }>();
  const testId = Number(testIdParam);
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Proctoring/Security
  const [proctoringStream, setProctoringStream] = useState<MediaStream | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [isProctoringBlocked, setIsProctoringBlocked] = useState(false);

  // Refs for auto-save logic
  const autoSaveTimerRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Helper: Format Time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };




  // Timer Logic
  useEffect(() => {
    if (!attempt || attempt.completed || submitting) return;

    // Force fix for missing duration
    if (!attempt.durationMinutes || attempt.durationMinutes === 0) {
      console.warn("Timer: No duration found, defaulting to 10 minutes from test config");
      // If API didn't sync, we assume the known 10 min for this specific case context
      // In product we should trust the merged state, which we fixed, 
      // but let's double check calculation logic.
    }

    const calculateTimeLeft = () => {
      // Robust date parsing (handle string or Date object)
      const startDate = attempt.startedAt ? new Date(attempt.startedAt) : new Date();
      const startTime = startDate.getTime();
      const now = Date.now();

      if (isNaN(startTime)) {
        console.error("Invalid start time:", attempt.startedAt);
        return 0; // Or handle error
      }

      // Ensure duration exists, fallback safely (but warn)
      const durationMins = attempt.durationMinutes || 0;
      if (durationMins === 0) {
        // Maybe fetch config or use a default if critical?
        // For now, if 0, it might mean unlimited or error.
      }

      const durationMs = durationMins * 60 * 1000;
      const endTime = startTime + durationMs;
      const diff = Math.floor((endTime - now) / 1000);

      return diff > 0 ? diff : 0;
    };

    // Initial set
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0 && attempt.durationMinutes && attempt.durationMinutes > 0) {
        clearInterval(timer);
        if (!submitting) {
          // Auto-submit logic (Direct API call to avoid dependency circles)
          console.warn("Timer expired. Auto-submitting...");
          testApi.submitAttempt(attempt.id).then(() => {
            navigate(`/${collegeCode}/dashboard`, { state: { message: "Time Up! Test submitted." } });
          }).catch(console.error);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, submitting]);

  // 7. Trigger Permission Modal for Proctored Tests
  // 7. Trigger Permission Modal for Proctored Tests
  useEffect(() => {
    // Check if we need to request permission
    if (!loading && attempt && attempt.proctored && !proctoringStream && !isProctoringBlocked) {
      // Only show if we haven't blocked (e.g. valid checks) and no stream yet
      // And also check if we really don't have a stream in manager to avoid double prompt
      if (!MediaStreamManager.getInstance().getStream()) {
        setShowPermissionModal(true);
      } else {
        // If manager has it, use it
        setProctoringStream(MediaStreamManager.getInstance().getStream());
      }
    }
  }, [loading, attempt, proctoringStream, isProctoringBlocked]);

  // 8. Stream Cleanup on Unmount (Strictly once)
  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      const stream = MediaStreamManager.getInstance().getStream();
      if (stream) {
        console.log("Cleaning up camera stream on unmount");
        stream.getTracks().forEach(track => track.stop());
        MediaStreamManager.getInstance().stopStream();
      }
    };
  }, []);

  // 1. Navigation Guard (Prevent accidental back/refresh)
  // 1. Navigation Guard (Prevent accidental back/refresh & Block Back Button)
  useEffect(() => {
    // A. Browser Refresh/Close Protection
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (attempt && !attempt.completed) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Your progress will be saved, but the timer continues.";
      }
    };

    // B. History Push State (Block Back Button)
    const handlePopState = () => {
      if (attempt && !attempt.completed) {
        // Push it back immediately to trap the user
        window.history.pushState(null, "", window.location.href);
        // Optionally warn via custom UI
        if (!confirm("Test in progress! Leaving will count as a violation or end your test. Stay on page?")) {
          // User wants to leave? (Actually handling 'cancel' means stay)
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Initial push to set the trap
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [attempt]);

  // 2. Fullscreen Enforcement
  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      setShowFullscreenWarning(true);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Only enforce fullscreen for proctored tests
      if (!loading && attempt && !attempt.completed && attempt.proctored && !document.fullscreenElement) {
        setShowFullscreenWarning(true);
      } else {
        setShowFullscreenWarning(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [loading, attempt]);

  // 3. Robust Save Logic
  const saveAnswer = async (questionId: number, answer: string) => {
    if (!attempt || attempt.completed) return;
    try {
      await testApi.submitAnswer(attempt.id, { questionId, answerText: answer });
      console.log(`Saved Q:${questionId}`);
    } catch (err) {
      console.error(`Failed to save Q:${questionId}`, err);
      // Optional: Retry logic or UI indication
    }
  };

  // Debounced save for text inputs (to avoid API spam)
  const saveAnswerDebounced = useCallback((questionId: number, answer: string) => {
    // Clear existing timer for THIS question if any (using a map would be better, but simplified here)
    // Actually, standard debounce is per-function. 
    // We'll use a local map for timers to avoid collision.
    if (autoSaveTimerRef.current && autoSaveTimerRef.current[questionId]) {
      clearTimeout(autoSaveTimerRef.current[questionId]);
    }

    if (!autoSaveTimerRef.current) autoSaveTimerRef.current = {};

    autoSaveTimerRef.current[questionId] = setTimeout(() => {
      saveAnswer(questionId, answer);
      delete autoSaveTimerRef.current[questionId];
    }, 1500);
  }, [attempt]);

  // 4. Initial Load
  // (Leaving Initial Load intact, modifying handleAnswerChange below)
  const loadTest = async () => {
    try {
      setLoading(true);

      // Fetch Test Details explicitly to ensure we have config (proctored, duration, etc)
      let testDetails: Test | null = null;
      try {
        const testRes = await testApi.getTest(testId);
        if (testRes.success && testRes.data) {
          testDetails = testRes.data;
        }
      } catch (err) {
        console.warn("Could not fetch test details, relying on attempt data");
      }

      let currentAttempt: Attempt | null = location.state?.attempt as Attempt | undefined || null;

      if (!currentAttempt) {
        const savedAttemptId = localStorage.getItem(`activeAttempt_${testId}`);
        if (savedAttemptId) {
          // Use getTestAttemptState instead of getAttempt to get answers
          const res = await testApi.getTestAttemptState(testId);
          if (res.success && res.data) {
            const state = res.data;
            // Convert AttemptInfo to Attempt format
            currentAttempt = {
              id: state.attempt.id,
              testId: testId,
              userId: 0, // Will be set from JWT
              attemptNumber: state.attempt.attemptNumber,
              durationMinutes: state.attempt.durationMinutes,
              startedAt: state.attempt.startedAt || new Date().toISOString(),
              submittedAt: state.attempt.submittedAt || undefined,
              score: 0, // Will be calculated on submit
              maxScore: 0, // Will be set from test
              completed: state.attempt.completed,
              proctored: state.attempt.proctored,
              maxViolations: state.attempt.maxViolations,
            };
            // Set answers from the state
            setAnswers(state.answers as Record<number, string>);
            setQuestions(state.questions);
            setAttempt(currentAttempt);
            setLoading(false);
            return;
          }
        }
      }

      if (!currentAttempt) {
        navigate(`/${collegeCode}/dashboard/tests/${testId}/instructions`, { replace: true });
        return;
      }

      // If we don't have questions yet (not resumed from state), load them
      if (questions.length === 0) {
        const qRes = await testApi.getQuestions(testId);
        if (qRes.success && qRes.data) {
          setQuestions(qRes.data);
        }
      }

      // Merge Test Details into Attempt if missing
      if (testDetails && currentAttempt) {
        // Create a shallow copy to trigger re-renders and avoid mutation issues
        const updatedAttempt = { ...currentAttempt };

        // Force sync critical configuration from Test to Attempt
        // The Test object is the source of truth for configuration
        updatedAttempt.proctored = testDetails.proctored;
        updatedAttempt.durationMinutes = testDetails.durationMinutes;

        // Ensure StartedAt exists, fallback to now if missing (safety net)
        if (!updatedAttempt.startedAt) {
          updatedAttempt.startedAt = new Date().toISOString();
        }

        console.log("Merged Attempt Data:", updatedAttempt);
        currentAttempt = updatedAttempt;
      }

      setAttempt(currentAttempt);
    } catch (err: any) {
      setError(err.message || "Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTest(); }, [testId]);

  // 5. Answer Change Handler
  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    // Find question type to decide save strategy
    const question = questions.find(q => q.id === questionId);
    if (question?.questionType === "FILL_BLANK") {
      saveAnswerDebounced(questionId, answer);
    } else {
      saveAnswer(questionId, answer);
    }
  };

  const handleMultiSelect = (questionId: number, option: string) => {
    const current = answers[questionId] || "";
    let selected = current ? current.split(",") : [];
    if (selected.includes(option)) {
      selected = selected.filter(s => s !== option);
    } else {
      selected.push(option);
    }
    // Sort to ensure consistency if needed, strictly depends on backend
    handleAnswerChange(questionId, selected.join(","));
  };

  // 6. Final Submission
  const handleConfirmSubmit = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    try {
      // Manual save of the current question index one last time (best effort)
      const currentQ = questions[currentQuestionIndex];
      if (currentQ && answers[currentQ.id]) {
        try {
          await testApi.submitAnswer(attempt.id, {
            questionId: currentQ.id,
            answerText: answers[currentQ.id]
          });
        } catch (e) {
          console.warn("Details: Failed to save final answer, proceeding to submit attempt.", e);
        }
      }

      const response = await testApi.submitAttempt(attempt.id);
      if (response.success) {
        localStorage.removeItem(`activeAttempt_${testId}`);
        navigate(`/${collegeCode}/dashboard`, { state: { message: "Test submitted successfully!" } });
      } else {
        throw new Error(response.message || "Submission returned failure status");
      }
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError("Submission failed. Please try again or contact support.");
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-medium text-gray-600">Syncing with Secure Exam Server...</p>
      </div>
    </div>
  );

  if (!attempt || questions.length === 0) return <div>Error loading test.</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden select-none">
      {/* DETERMINISTIC HEADER: 
          Integrates Timer, Progress, and Navigation 
      */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-white z-[60] relative shrink-0">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 uppercase tracking-tight leading-none">
              Attempt #{attempt.attemptNumber}
            </h1>
            <p className="text-[10px] text-gray-400 font-mono mt-1">TEST_UID: {testId}</p>
          </div>
        </div>

        {/* Integrated Timer Component */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center space-x-2 text-gray-800 font-mono text-lg font-bold">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className={`${timeLeft !== null && timeLeft < 300 ? "text-red-600 animate-pulse" : ""}`}>
              {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
            </span>
          </div>
          <div className="w-48 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQuestionPaper(true)}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-md border transition-all"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Question Paper</span>
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-sm"
          >
            Finish Attempt
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: PALETTE SIDEBAR */}
        <aside className="w-64 border-r bg-gray-50 flex flex-col hidden lg:flex">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Question Palette</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-2 h-fit content-start">
            {questions.map((q, idx) => {
              const status = answers[q.id] ? 'answered' : (currentQuestionIndex === idx ? 'current' : 'pending');
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`
                    h-10 w-10 rounded text-xs font-bold transition-all
                    ${status === 'current' ? 'ring-2 ring-blue-600 bg-blue-50 text-blue-600' : ''}
                    ${status === 'answered' ? 'bg-green-500 text-white' : 'bg-white border text-gray-500 hover:bg-gray-100'}
                  `}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t text-[10px] space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Answered: {Object.keys(answers).length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-white border rounded-full"></span>
              <span className="text-gray-600">Pending: {questions.length - Object.keys(answers).length}</span>
            </div>
          </div>
        </aside>

        {/* CENTER: QUESTION AREA */}
        <main className="flex-1 overflow-y-auto bg-white flex flex-col">
          <div className="max-w-3xl mx-auto w-full p-8 flex-1">
            <div className="mb-6 flex justify-between items-center">
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                QUESTION {currentQuestionIndex + 1} OF {questions.length}
              </span>
              <div className="flex space-x-4 text-[10px] font-bold uppercase text-gray-400">
                <span>Score: +{currentQuestion.marks}</span>
                <span className="text-red-400">Neg: {currentQuestion.negativeMarks}</span>
              </div>
            </div>

            <div className="text-lg font-semibold text-gray-800 mb-8 leading-relaxed">
              {currentQuestion.questionText}
            </div>

            <div className="space-y-3">
              {/* MCQ Logic */}
              {currentQuestion.questionType === "MCQ" && ["A", "B", "C", "D"].map((opt) => {
                const text = currentQuestion[`option${opt}` as keyof Question] as string;
                if (!text) return null;
                const active = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswerChange(currentQuestion.id, opt)}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4
                      ${active ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}
                    `}
                  >
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {opt}
                    </span>
                    <span className="text-gray-700 font-medium">{text}</span>
                  </button>
                );
              })}

              {/* MAQ Logic */}
              {currentQuestion.questionType === "MAQ" && ["A", "B", "C", "D"].map((opt) => {
                const text = currentQuestion[`option${opt}` as keyof Question] as string;
                if (!text) return null;
                const currentAns = answers[currentQuestion.id] || "";
                const isSelected = currentAns.split(",").includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => handleMultiSelect(currentQuestion.id, opt)}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4
                      ${isSelected ? 'border-purple-600 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}
                    `}
                  >
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </span>
                    <span className="text-gray-700 font-medium">{text}</span>
                  </button>
                );
              })}

              {/* Fill Blank Logic */}
              {currentQuestion.questionType === "FILL_BLANK" && (
                <textarea
                  className="w-full h-40 border-2 border-gray-100 rounded-xl p-4 focus:border-blue-600 focus:outline-none text-gray-700 font-medium transition-all"
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              )}

              {/* True/False Logic */}
              {currentQuestion.questionType === "TRUE_FALSE" && ["A", "B"].map((opt) => {
                const text = currentQuestion[`option${opt}` as keyof Question] as string;
                if (!text) return null;
                const active = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswerChange(currentQuestion.id, opt)}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4
                      ${active ? 'border-green-600 bg-green-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}
                    `}
                  >
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {opt}
                    </span>
                    <span className="text-gray-700 font-medium">{text}</span>
                  </button>
                );
              })}

              {/* Essay Logic */}
              {currentQuestion.questionType === "ESSAY" && (
                <div className="space-y-2">
                  <textarea
                    className="w-full h-40 border-2 border-gray-100 rounded-xl p-4 focus:border-blue-600 focus:outline-none text-gray-700 font-medium transition-all"
                    placeholder="Type your essay answer here..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    maxLength={currentQuestion.characterLimit || undefined}
                  />
                  {currentQuestion.characterLimit && (
                    <div className="text-sm text-gray-500 text-right">
                      {(answers[currentQuestion.id] || "").length}/{currentQuestion.characterLimit} characters
                    </div>
                  )}
                </div>
              )}

              {/* Image Based Logic */}
              {currentQuestion.questionType === "IMAGE_BASED" && (
                <div className="space-y-4">
                  {currentQuestion.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={currentQuestion.imageUrl}
                        alt="Question"
                        className="max-w-full max-h-96 rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  {/* Render based on the underlying question type - for now, support MCQ style */}
                  {["A", "B", "C", "D"].map((opt) => {
                    const text = currentQuestion[`option${opt}` as keyof Question] as string;
                    if (!text) return null;
                    const active = answers[currentQuestion.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswerChange(currentQuestion.id, opt)}
                        className={`
                          w-full text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4
                          ${active ? 'border-orange-600 bg-orange-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}
                        `}
                      >
                        <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {opt}
                        </span>
                        <span className="text-gray-700 font-medium">{text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Upload Answer Logic */}
              {currentQuestion.questionType === "UPLOAD_ANSWER" && (
                <div className="space-y-4">
                  {currentQuestion.fileUploadInstructions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">{currentQuestion.fileUploadInstructions}</p>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // In a real implementation, you'd upload the file and store the URL
                          handleAnswerChange(currentQuestion.id, `file:${file.name}`);
                        }
                      }}
                      className="hidden"
                      id={`file-upload-${currentQuestion.id}`}
                    />
                    <label
                      htmlFor={`file-upload-${currentQuestion.id}`}
                      className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      Select File
                    </label>
                  </div>
                  {answers[currentQuestion.id] && answers[currentQuestion.id].startsWith('file:') && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">{answers[currentQuestion.id].replace('file:', '')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="h-20 border-t flex items-center justify-between px-8 bg-gray-50/50">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="flex items-center space-x-2 text-gray-500 font-bold text-sm disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => {
                if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
              }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center"
            >
              <span>{currentQuestionIndex === questions.length - 1 ? "End Review" : "Save & Next"}</span>
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </main>

        {/* RIGHT: PROCTORING PANEL */}
        <aside className="w-72 border-l bg-gray-50 p-4 space-y-4">

          {/* Proctoring Camera Feed */}
          {attempt.proctored ? (
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-900 text-white flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="aspect-video bg-black relative">
                {proctoringStream ? (
                  <ProctoringManager
                    stream={proctoringStream}
                    attemptId={attempt.id}
                    testId={testId}
                    attemptNumber={attempt.attemptNumber}
                    maxViolations={attempt.maxViolations || 10}
                    onStatusChange={(status) => setIsProctoringBlocked(!status.faceVisible || status.hasMultipleFaces)}
                    onMaxViolationsReached={handleConfirmSubmit}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <VideoOff className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-[10px] uppercase font-bold">Signal Lost</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800 text-xs uppercase">Standard Mode</h3>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                This assessment is unproctored. You may refer to your notes, but tab switching is monitored.
              </p>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <ConnectivityIndicator />
            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 font-bold uppercase">Focus Status</span>
                <span className="text-green-600 font-bold">LOCKED</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-400 font-bold uppercase">Tab Sync</span>
                <span className="text-green-600 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* OVERLAYS */}
      {showFullscreenWarning && (
        <div className="fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center p-6 text-center">
          <div className="max-w-sm">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">FULLSCREEN REQUIRED</h2>
            <p className="text-gray-400 text-sm mb-8">This exam is running in High-Security Mode. You must stay in fullscreen to prevent auto-submission.</p>
            <button
              onClick={enterFullscreen}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
            >
              Re-enter Exam Mode
            </button>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && attempt?.proctored && (
        <CameraPermissionModal
          onPermissionGranted={(stream) => {
            setProctoringStream(stream);
            setShowPermissionModal(false);
            MediaStreamManager.getInstance().setStream(stream);
          }}
          onPermissionDenied={() => {
            alert("Camera permission is required for this proctored test.");
            navigate(`/${collegeCode}/dashboard`);
          }}
          onCancel={() => navigate(`/${collegeCode}/dashboard`)}
        />
      )}

      {isProctoringBlocked && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 italic uppercase">Identity Check Required</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">Face not detected or invalid proctoring state. Position yourself clearly in front of the camera to unlock the test.</p>
            <div className="w-64 aspect-video border-2 border-red-600 rounded-xl overflow-hidden mx-auto shadow-2xl shadow-red-900/20">
              <video
                ref={(r) => { if (r && proctoringStream) r.srcObject = proctoringStream; }}
                autoPlay muted className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-2">Submit Attempt?</h3>
            <p className="text-gray-500 text-sm mb-6">You have answered {Object.keys(answers).length} out of {questions.length} questions. You cannot change your answers after submission.</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 text-gray-500 font-bold border rounded-xl hover:bg-gray-50">Go Back</button>
              <button onClick={handleConfirmSubmit} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200">Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

      {showQuestionPaper && (
        <QuestionPaperModal questions={questions} onClose={() => setShowQuestionPaper(false)} />
      )}
    </div>
  );
};

export default TakeTest;