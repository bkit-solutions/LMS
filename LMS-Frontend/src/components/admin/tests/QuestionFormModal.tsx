import React, { useState } from "react";
import { HelpCircle, X, AlertCircle, Loader2, Check, Image as ImageIcon, Video, Music, FileText } from "lucide-react";
import { testApi } from "../../../services/testApi";
import type { Question, QuestionTypeType } from "../../../types";

interface QuestionFormModalProps {
    testId: number;
    question: Question | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
    testId,
    question,
    onSuccess,
    onCancel
}) => {

    const [formData, setFormData] = useState({
        questionText: question?.questionText || "",
        questionType: (question?.questionType || "MCQ") as QuestionTypeType,
        marks: question?.marks || 1,
        negativeMarks: question?.negativeMarks || 0,
        optionA: question?.optionA || "",
        optionB: question?.optionB || "",
        optionC: question?.optionC || "",
        optionD: question?.optionD || "",
        optionAImageUrl: question?.optionAImageUrl || "",
        optionBImageUrl: question?.optionBImageUrl || "",
        optionCImageUrl: question?.optionCImageUrl || "",
        optionDImageUrl: question?.optionDImageUrl || "",
        correctOption: question?.correctOption || "",
        correctOptionsCsv: question?.correctOptionsCsv || "",
        correctAnswer: question?.correctAnswer || "",
        characterLimit: question?.characterLimit,
        imageUrl: question?.imageUrl || "",
        videoUrl: question?.videoUrl || "",
        audioUrl: question?.audioUrl || "",
        allowFileUpload: question?.allowFileUpload || false,
        fileUploadInstructions: question?.fileUploadInstructions || "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        setLoading(true);
        setError(null);

        try {

            const questionData: any = {
                questionType: formData.questionType,
                questionText: formData.questionText,
                marks: formData.marks,
                negativeMarks: formData.negativeMarks,
            };

            if (formData.questionType === "MCQ") {
                questionData.optionA = formData.optionA;
                questionData.optionB = formData.optionB;
                questionData.optionC = formData.optionC;
                questionData.optionD = formData.optionD;
                questionData.optionAImageUrl = formData.optionAImageUrl;
                questionData.optionBImageUrl = formData.optionBImageUrl;
                questionData.optionCImageUrl = formData.optionCImageUrl;
                questionData.optionDImageUrl = formData.optionDImageUrl;
                questionData.correctOption = formData.correctOption;
            }
            else if (formData.questionType === "MAQ") {
                questionData.optionA = formData.optionA;
                questionData.optionB = formData.optionB;
                questionData.optionC = formData.optionC;
                questionData.optionD = formData.optionD;
                questionData.optionAImageUrl = formData.optionAImageUrl;
                questionData.optionBImageUrl = formData.optionBImageUrl;
                questionData.optionCImageUrl = formData.optionCImageUrl;
                questionData.optionDImageUrl = formData.optionDImageUrl;
                questionData.correctOptionsCsv = formData.correctOptionsCsv;
            }
            else if (formData.questionType === "FILL_BLANK") {
                questionData.correctAnswer = formData.correctAnswer;
            }
            else if (formData.questionType === "TRUE_FALSE") {
                questionData.optionA = "True";
                questionData.optionB = "False";
                questionData.correctOption = formData.correctOption;
            }
            else if (formData.questionType === "ESSAY") {
                questionData.characterLimit = formData.characterLimit;
            }
            else if (formData.questionType === "IMAGE_BASED") {
                questionData.imageUrl = formData.imageUrl;
                questionData.optionA = formData.optionA;
                questionData.optionB = formData.optionB;
                questionData.optionC = formData.optionC;
                questionData.optionD = formData.optionD;
                questionData.correctOption = formData.correctOption;
            }
            else if (formData.questionType === "VIDEO_BASED") {
                questionData.videoUrl = formData.videoUrl;
                questionData.optionA = formData.optionA;
                questionData.optionB = formData.optionB;
                questionData.optionC = formData.optionC;
                questionData.optionD = formData.optionD;
                questionData.correctOption = formData.correctOption;
            }
            else if (formData.questionType === "AUDIO_BASED") {
                questionData.audioUrl = formData.audioUrl;
                questionData.optionA = formData.optionA;
                questionData.optionB = formData.optionB;
                questionData.optionC = formData.optionC;
                questionData.optionD = formData.optionD;
                questionData.correctOption = formData.correctOption;
            }
            else if (formData.questionType === "UPLOAD_ANSWER") {
                questionData.allowFileUpload = formData.allowFileUpload;
                questionData.fileUploadInstructions = formData.fileUploadInstructions;
            }

            const response = question
                ? await testApi.updateQuestion(question.id, questionData)
                : await testApi.createQuestion(testId, questionData);

            if (response.success) onSuccess();
            else setError(response.message);

        }
        catch (err: any) {

            setError(
                err.response?.data?.message ||
                `Failed to ${question ? "update" : "create"} question`
            );

        }
        finally {

            setLoading(false);

        }

    };


    return (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">

            {/* MODAL */}
            <div
                className="rounded-xl shadow-2xl max-w-4xl w-full my-8 border"
                style={{
                    background: "var(--card)",
                    borderColor: "var(--border)"
                }}
            >


                {/* HEADER */}
                <div
                    className="px-6 py-5 border-b"
                    style={{
                        background: "var(--primary)",
                        borderColor: "var(--border)"
                    }}
                >

                    <div className="flex items-center justify-between">

                        <div className="flex items-center space-x-3">

                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: "var(--card)" }}
                            >
                                <HelpCircle
                                    className="w-6 h-6"
                                    style={{ color: "var(--primary)" }}
                                />
                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-white">
                                    {question ? "Edit Question" : "Add New Question"}
                                </h2>

                                <p
                                    className="text-sm"
                                    style={{ color: "rgba(255,255,255,0.85)" }}
                                >
                                    Professional GATE/JEE-level exam question creation
                                </p>

                            </div>

                        </div>


                        <button
                            onClick={onCancel}
                            className="p-2 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: "white" }}
                        >
                            <X className="w-6 h-6" />
                        </button>

                    </div>

                </div>



                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
                >


                    {/* ERROR */}
                    {error && (

                        <div
                            className="flex items-center space-x-3 p-4 border rounded-lg"
                            style={{
                                background: "var(--primary-soft)",
                                borderColor: "var(--primary)",
                                color: "var(--primary)"
                            }}
                        >

                            <AlertCircle className="w-5 h-5 flex-shrink-0" />

                            <span className="text-sm font-medium">
                                {error}
                            </span>

                        </div>

                    )}



                    {/* QUESTION TYPE */}
                    <div>

                        <label className="block text-sm font-semibold text-text mb-2">
                            Question Type
                        </label>

                        <select
                            value={formData.questionType}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    questionType: e.target.value as QuestionTypeType,
                                    correctOption: "",
                                    correctOptionsCsv: "",
                                    correctAnswer: "",
                                    characterLimit: undefined,
                                    imageUrl: "",
                                    videoUrl: "",
                                    audioUrl: "",
                                    allowFileUpload: false,
                                    fileUploadInstructions: "",
                                })
                            }
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary transition-all"
                            style={{
                                borderColor: "var(--border)",
                                background: "var(--card)"
                            }}
                        >

                            <option value="MCQ">Multiple Choice (Single Answer) - MCQ</option>
                            <option value="MAQ">Multiple Answer Question - MAQ/MSQ</option>
                            <option value="FILL_BLANK">Fill in the Blank</option>
                            <option value="TRUE_FALSE">True / False</option>
                            <option value="ESSAY">Essay / Descriptive Answer</option>
                            <option value="IMAGE_BASED">Image Based Question</option>
                            <option value="VIDEO_BASED">Video Based Question</option>
                            <option value="AUDIO_BASED">Audio Based Question</option>
                            <option value="UPLOAD_ANSWER">Upload Answer (PDF/DOCX)</option>

                        </select>

                    </div>



                    {/* QUESTION TEXT */}
                    <div>

                        <label className="block text-sm font-semibold text-text mb-2">
                            Question Text
                        </label>

                        <textarea
                            value={formData.questionText}
                            onChange={(e) =>
                                setFormData({ ...formData, questionText: e.target.value })
                            }
                            rows={4}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary transition-all resize-none"
                            style={{
                                borderColor: "var(--border)",
                                background: "var(--card)"
                            }}
                            placeholder="Enter your question here..."
                            required
                        />

                    </div>


                    {/* MARKS */}
                    <div className="grid grid-cols-2 gap-6">

                        <div>

                            <label className="block text-sm font-semibold text-text mb-2">
                                Marks
                            </label>

                            <input
                                type="number"
                                value={formData.marks}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        marks: parseInt(e.target.value)
                                    })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--card)"
                                }}
                                min="1"
                            />

                        </div>


                        <div>

                            <label className="block text-sm font-semibold text-text mb-2">
                                Negative Marks
                            </label>

                            <input
                                type="number"
                                value={formData.negativeMarks}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        negativeMarks: parseInt(e.target.value)
                                    })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--card)"
                                }}
                                min="0"
                            />

                        </div>

                    </div>



                    {/* IMAGE URL for IMAGE_BASED */}
                    {formData.questionType === "IMAGE_BASED" && (
                        <div>
                            <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Question Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, imageUrl: e.target.value })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--card)"
                                }}
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.imageUrl && (
                                <img src={formData.imageUrl} alt="Question" className="mt-3 max-h-64 rounded-lg border" />
                            )}
                            <p className="text-xs text-text-secondary mt-2">Upload images to a hosting service and paste the URL here</p>
                        </div>
                    )}

                    {/* VIDEO URL for VIDEO_BASED */}
                    {formData.questionType === "VIDEO_BASED" && (
                        <div>
                            <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Question Video URL
                            </label>
                            <input
                                type="url"
                                value={formData.videoUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, videoUrl: e.target.value })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--card)"
                                }}
                                placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                            />
                            <p className="text-xs text-text-secondary mt-2">Supports direct video files (MP4, WebM) or YouTube/Vimeo embed links</p>
                        </div>
                    )}

                    {/* AUDIO URL for AUDIO_BASED */}
                    {formData.questionType === "AUDIO_BASED" && (
                        <div>
                            <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-2">
                                <Music className="w-4 h-4" />
                                Question Audio URL
                            </label>
                            <input
                                type="url"
                                value={formData.audioUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, audioUrl: e.target.value })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--card)"
                                }}
                                placeholder="https://example.com/audio.mp3"
                            />
                            {formData.audioUrl && (
                                <audio controls className="w-full mt-3 rounded-lg">
                                    <source src={formData.audioUrl} />
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                            <p className="text-xs text-text-secondary mt-2">Supports MP3, WAV, OGG audio formats</p>
                        </div>
                    )}



                    {/* OPTIONS — MCQ + MAQ + IMAGE_BASED + VIDEO_BASED + AUDIO_BASED */}
                    {(formData.questionType === "MCQ" ||
                        formData.questionType === "MAQ" ||
                        formData.questionType === "IMAGE_BASED" ||
                        formData.questionType === "VIDEO_BASED" ||
                        formData.questionType === "AUDIO_BASED") && (

                        <div>

                            <label className="block text-sm font-semibold text-text mb-3">
                                Answer Options {(formData.questionType === "MCQ" || formData.questionType === "MAQ") && <span className="text-xs font-normal text-text-secondary">(Images supported for professional exams)</span>}
                            </label>

                            <div className="space-y-4">

                                {["A", "B", "C", "D"].map((opt) => (

                                    <div key={opt} className="border rounded-lg p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                                        
                                        <div className="flex items-center space-x-3 mb-3">

                                            <span
                                                className="flex items-center justify-center w-10 h-10 font-bold rounded-lg flex-shrink-0"
                                                style={{
                                                    background: "var(--primary)",
                                                    color: "white"
                                                }}
                                            >
                                                {opt}
                                            </span>


                                            <input
                                                type="text"
                                                value={
                                                    formData[`option${opt}` as keyof typeof formData] as string
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        [`option${opt}`]: e.target.value
                                                    })
                                                }
                                                className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                                style={{
                                                    borderColor: "var(--border)",
                                                    background: "var(--card)"
                                                }}
                                                placeholder={`Option ${opt} text`}
                                                required
                                            />


                                            {formData.questionType === "MCQ" && (

                                                <input
                                                    type="radio"
                                                    name="correctOption"
                                                    value={opt}
                                                    checked={formData.correctOption === opt}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            correctOption: e.target.value
                                                        })
                                                    }
                                                    className="w-5 h-5 flex-shrink-0"
                                                    style={{ accentColor: "var(--primary)" }}
                                                    title="Mark as correct answer"
                                                />

                                            )}

                                            {formData.questionType === "MAQ" && (

                                                <input
                                                    type="checkbox"
                                                    checked={formData.correctOptionsCsv.includes(opt)}
                                                    onChange={() => {

                                                        const current =
                                                            formData.correctOptionsCsv.split(",").filter(x => x);

                                                        const newValue =
                                                            current.includes(opt)
                                                                ? current.filter(x => x !== opt)
                                                                : [...current, opt];

                                                        setFormData({
                                                            ...formData,
                                                            correctOptionsCsv: newValue.join(",")
                                                        });

                                                    }}
                                                    className="w-5 h-5 flex-shrink-0"
                                                    style={{ accentColor: "var(--primary)" }}
                                                    title="Mark as correct answer"
                                                />

                                            )}

                                            {(formData.questionType === "IMAGE_BASED" ||
                                             formData.questionType === "VIDEO_BASED" ||
                                             formData.questionType === "AUDIO_BASED") && (

                                                <input
                                                    type="radio"
                                                    name="correctOption"
                                                    value={opt}
                                                    checked={formData.correctOption === opt}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            correctOption: e.target.value
                                                        })
                                                    }
                                                    className="w-5 h-5 flex-shrink-0"
                                                    style={{ accentColor: "var(--primary)" }}
                                                    title="Mark as correct answer"
                                                />

                                            )}

                                        </div>

                                        {/* Image URL for each option (MCQ/MAQ only) */}
                                        {(formData.questionType === "MCQ" || formData.questionType === "MAQ") && (
                                            <div className="ml-13 mt-2">
                                                <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
                                                    <ImageIcon className="w-3 h-3" />
                                                    Optional Image for Option {opt}
                                                </label>
                                                <input
                                                    type="url"
                                                    value={
                                                        formData[`option${opt}ImageUrl` as keyof typeof formData] as string
                                                    }
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            [`option${opt}ImageUrl`]: e.target.value
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-primary"
                                                    style={{
                                                        borderColor: "var(--border)",
                                                        background: "var(--card)"
                                                    }}
                                                    placeholder="https://example.com/option-image.jpg"
                                                />
                                                {formData[`option${opt}ImageUrl` as keyof typeof formData] && (
                                                    <img 
                                                        src={formData[`option${opt}ImageUrl` as keyof typeof formData] as string} 
                                                        alt={`Option ${opt}`} 
                                                        className="mt-2 max-h-32 rounded border"
                                                    />
                                                )}
                                            </div>
                                        )}

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}

                    {/* FILL IN THE BLANK */}
                    {formData.questionType === "FILL_BLANK" && (
                        <div>
                            <label className="block text-sm font-semibold text-text mb-2">
                                Correct Answer
                            </label>
                            <input
                                type="text"
                                value={formData.correctAnswer}
                                onChange={(e) =>
                                    setFormData({ ...formData, correctAnswer: e.target.value })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--card)"
                                }}
                                placeholder="Enter the correct answer (case-sensitive)"
                                required
                            />
                            <p className="text-xs text-text-secondary mt-2">Answer matching will be case-sensitive</p>
                        </div>
                    )}

                    {/* TRUE/FALSE */}
                    {formData.questionType === "TRUE_FALSE" && (
                        <div>
                            <label className="block text-sm font-semibold text-text mb-3">
                                Correct Answer
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 px-6 py-4 border-2 rounded-lg cursor-pointer hover:bg-surface transition-all"
                                    style={{ 
                                        borderColor: formData.correctOption === "A" ? "var(--primary)" : "var(--border)",
                                        background: formData.correctOption === "A" ? "var(--primary-soft)" : "transparent"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="correctOption"
                                        value="A"
                                        checked={formData.correctOption === "A"}
                                        onChange={(e) =>
                                            setFormData({ ...formData, correctOption: e.target.value })
                                        }
                                        className="w-5 h-5"
                                        style={{ accentColor: "var(--primary)" }}
                                    />
                                    <span className="font-bold text-lg text-text">True</span>
                                </label>
                                <label className="flex items-center gap-3 px-6 py-4 border-2 rounded-lg cursor-pointer hover:bg-surface transition-all"
                                    style={{ 
                                        borderColor: formData.correctOption === "B" ? "var(--primary)" : "var(--border)",
                                        background: formData.correctOption === "B" ? "var(--primary-soft)" : "transparent"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="correctOption"
                                        value="B"
                                        checked={formData.correctOption === "B"}
                                        onChange={(e) =>
                                            setFormData({ ...formData, correctOption: e.target.value })
                                        }
                                        className="w-5 h-5"
                                        style={{ accentColor: "var(--primary)" }}
                                    />
                                    <span className="font-bold text-lg text-text">False</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* ESSAY */}
                    {formData.questionType === "ESSAY" && (
                        <div>
                            <label className="block text-sm font-semibold text-text mb-2">
                                Character Limit (Optional)
                            </label>
                            <input
                                type="number"
                                value={formData.characterLimit || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        characterLimit: e.target.value ? parseInt(e.target.value) : undefined
                                    })
                                }
                                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                                style={{
                                    borderColor: "var(--border)",
                                    background: "var(--card)"
                                }}
                                min="50"
                                placeholder="Leave empty for unlimited (e.g., 500 for short essay)"
                            />
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    <strong>Note:</strong> Essay questions require manual evaluation by faculty. Students will write  their answers in a text box and submit for grading.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* UPLOAD ANSWER */}
                    {formData.questionType === "UPLOAD_ANSWER" && (
                        <div className="space-y-4">
                            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={formData.allowFileUpload}
                                    onChange={(e) =>
                                        setFormData({ ...formData, allowFileUpload: e.target.checked })
                                    }
                                    className="w-5 h-5 text-blue-600"
                                    style={{ accentColor: "var(--primary)" }}
                                />
                                <label className="ml-3">
                                    <span className="block text-sm font-semibold text-blue-900">
                                        Enable File Upload
                                    </span>
                                    <span className="block text-xs text-blue-700">
                                        Students can upload PDF, DOCX, or image files
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Upload Instructions
                                </label>
                                <textarea
                                    value={formData.fileUploadInstructions}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fileUploadInstructions: e.target.value })
                                    }
                                    rows={4}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary resize-none"
                                    style={{
                                        borderColor: "var(--border)",
                                        background: "var(--card)"
                                    }}
                                    placeholder="Provide specific instructions for file format, size, naming convention, content requirements, etc.&#10;&#10;Example: Upload a single PDF file (max 10MB) with your solution. Include your name and roll number on the first page."
                                />
                            </div>

                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-xs text-text-secondary">
                                    <strong>Accepted formats:</strong> PDF (.pdf), Word Documents (.docx, .doc), Images (.jpg, .png)
                                </p>
                            </div>
                        </div>
                    )}

                </form>



                {/* FOOTER */}
                <div
                    className="px-6 py-4 border-t flex justify-end space-x-3"
                    style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)"
                    }}
                >

                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 text-sm font-semibold rounded-lg transition-colors hover:bg-gray-200"
                        style={{
                            background: "var(--surface)",
                            color: "var(--text-secondary)"
                        }}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "var(--primary)" }}
                    >

                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                <span>
                                    {question ? "Updating..." : "Creating..."}
                                </span>
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                <span>
                                    {question ? "Update Question" : "Create Question"}
                                </span>
                            </>
                        )}

                    </button>

                </div>

            </div>

        </div>

    );

};

export default QuestionFormModal;
