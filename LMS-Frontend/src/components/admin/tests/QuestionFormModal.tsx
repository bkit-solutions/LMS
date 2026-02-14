import React, { useState } from "react";
import { HelpCircle, X, AlertCircle, Loader2, Check } from "lucide-react";
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
        correctOption: question?.correctOption || "",
        correctOptionsCsv: question?.correctOptionsCsv || "",
        correctAnswer: question?.correctAnswer || "",
        characterLimit: question?.characterLimit,
        imageUrl: question?.imageUrl || "",
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
                questionData.correctOption = formData.correctOption;

            }
            else if (formData.questionType === "MAQ") {

                questionData.optionA = formData.optionA;
                questionData.optionB = formData.optionB;
                questionData.optionC = formData.optionC;
                questionData.optionD = formData.optionD;
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
                className="rounded-xl shadow-2xl max-w-3xl w-full my-8 border"
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
                                    Fill in the details below
                                </p>

                            </div>

                        </div>


                        <button
                            onClick={onCancel}
                            className="p-2 rounded-lg transition-colors"
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

                            <option value="MCQ">Multiple Choice (Single Correct Answer)</option>
                            <option value="MAQ">Multiple Answer Question</option>
                            <option value="FILL_BLANK">Fill in the Blank</option>
                            <option value="TRUE_FALSE">True / False</option>
                            <option value="ESSAY">Essay</option>
                            <option value="IMAGE_BASED">Image Based</option>
                            <option value="UPLOAD_ANSWER">Upload Answer</option>

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



                    {/* OPTIONS — MCQ + MAQ */}
                    {(formData.questionType === "MCQ" ||
                        formData.questionType === "MAQ") && (

                        <div>

                            <label className="block text-sm font-semibold text-text mb-3">
                                Options
                            </label>

                            <div className="space-y-3">

                                {["A", "B", "C", "D"].map((opt) => (

                                    <div key={opt} className="flex items-center space-x-3">

                                        <span
                                            className="flex items-center justify-center w-10 h-10 font-bold rounded-lg"
                                            style={{
                                                background: "var(--surface)",
                                                color: "var(--text)"
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
                                            placeholder={`Option ${opt}`}
                                        />


                                        {formData.questionType === "MCQ" ? (

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
                                                className="w-5 h-5"
                                                style={{ accentColor: "var(--primary)" }}
                                            />

                                        ) : (

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
                                                className="w-5 h-5"
                                                style={{ accentColor: "var(--primary)" }}
                                            />

                                        )}

                                    </div>

                                ))}

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
                        onClick={onCancel}
                        className="px-6 py-3 text-sm font-semibold rounded-lg"
                        style={{
                            background: "var(--surface)",
                            color: "var(--text-secondary)"
                        }}
                    >
                        Cancel
                    </button>


                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md flex items-center space-x-2"
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
