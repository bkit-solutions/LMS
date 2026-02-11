import React from "react";
import { X } from "lucide-react";
import type { Question } from "../../types";

interface QuestionPaperModalProps {
  questions: Question[];
  onClose: () => void;
}

const QuestionPaperModal: React.FC<QuestionPaperModalProps> = ({ questions, onClose }) => {
  return (
    <div className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Question Paper</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Q{index + 1}. {question.questionText}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {question.marks} marks
                  </div>
                </div>
                {question.questionType === "MCQ" && (
                  <div className="ml-4 space-y-1">
                    {["A", "B", "C", "D"].map((opt) => {
                      const text = question[`option${opt}` as keyof Question] as string;
                      if (!text) return null;
                      return (
                        <div key={opt} className="text-sm text-gray-700">
                          {opt}. {text}
                        </div>
                      );
                    })}
                  </div>
                )}
                {question.questionType === "FILL_BLANK" && (
                  <div className="ml-4 text-sm text-gray-500 italic">
                    Fill in the blank
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperModal;