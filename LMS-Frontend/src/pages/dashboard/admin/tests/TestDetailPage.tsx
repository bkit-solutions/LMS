import React, { useEffect, useState } from "react";
import { ChevronLeft, Plus, Loader2, Upload, CheckCircle, Pencil, Trash2, HelpCircle, Play, Copy, Globe, Eye, EyeOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { testApi } from "../../../../services/testApi";
import { useCollegeTheme } from "../../../../hooks/useCollegeTheme";
import type { Test, Question } from "../../../../types";
import QuestionFormModal from "../../../../components/admin/tests/QuestionFormModal";
import EditTestModal from "../../../../components/admin/tests/EditTestModal";
import dummyQuestions from "../../../../data/dummyQuestions.json";

const TestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applyTheme } = useCollegeTheme();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [importing, setImporting] = useState(false);
  const [publishingLoading, setPublishingLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id || isNaN(parseInt(id))) {
      setError("Invalid test ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const testId = parseInt(id);
      const [testResponse, questionsResponse] = await Promise.all([
        testApi.getTest(testId),
        testApi.getQuestions(testId),
      ]);

      if (testResponse.success && testResponse.data) {
        setTest(testResponse.data);
      }

      if (questionsResponse.success && questionsResponse.data) {
        setQuestions(questionsResponse.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Test not found - redirect to 404 page with original path
        navigate("/404", { 
          replace: true, 
          state: { originalPath: window.location.pathname } 
        });
        return;
      }
      setError(err.response?.data?.message || "Failed to load test details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = (updatedTest: Test) => {
    setTest(updatedTest);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await testApi.deleteQuestion(questionId);
      if (response.success) {
        setQuestions(questions.filter(q => q.id !== questionId));
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  const handleDeleteTest = async () => {
    if (!test || !confirm("Are you sure you want to delete this test? This will also delete all questions and results associated with it.")) return;

    try {
      setLoading(true);
      const response = await testApi.deleteTest(test.id);
      if (response.success) {
        navigate('..');
      } else {
        setError(response.message || "Failed to delete test");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Delete test error:", err);
      if (err.response?.status === 200) {
        navigate('..');
      } else {
        setError(err.response?.data?.message || "Failed to delete test");
        setLoading(false);
      }
    }
  };

  const handleTogglePublish = async () => {
    if (!test) return;

    try {
      setPublishingLoading(true);
      const response = test.published 
        ? await testApi.unpublishTest(test.id)
        : await testApi.publishTest(test.id);
      
      if (response.success && response.data) {
        setTest(response.data);
        setError(null);
      } else {
        setError(response.message || `Failed to ${test.published ? 'unpublish' : 'publish'} test`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${test.published ? 'unpublish' : 'publish'} test`);
    } finally {
      setPublishingLoading(false);
    }
  };

  const getPublicUrl = () => {
    const collegeCode = window.location.pathname.split('/')[1];
    return `${window.location.origin}/${collegeCode}/dashboard/tests/${test?.id}/instructions`;
  };

  const handleCopyUrl = () => {
    const url = getPublicUrl();
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleImportDummyQuestions = async () => {
    if (!id) return;

    if (!confirm(`This will import ${dummyQuestions.length} dummy questions. Continue?`)) return;

    setImporting(true);
    setError(null);
    setImportProgress({ current: 0, total: dummyQuestions.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < dummyQuestions.length; i++) {
      const question = dummyQuestions[i];
      setImportProgress({ current: i + 1, total: dummyQuestions.length });

      try {
        const response = await testApi.createQuestion(parseInt(id), question as any);
        if (response.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err: any) {
        errorCount++;
      }
    }

    setImporting(false);
    await fetchData();

    if (errorCount > 0) {
      setError(`Import completed with ${successCount} successful and ${errorCount} failed questions.`);
    } else {
      alert(`Successfully imported ${successCount} questions!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <div className="text-red-600 text-lg font-semibold mb-2">Test Not Found</div>
          <p className="text-gray-600 mb-4">{error || "The test you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('..')}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('..')}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-gray-600 mt-1">{test.description || 'No description'}</p>
            </div>
            <span className={`px-3 py-1 rounded font-medium text-sm ${test.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {test.published ? 'Published' : 'Draft'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleTogglePublish}
              disabled={publishingLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 ${test.published ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              {publishingLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : test.published ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {publishingLoading ? 'Processing...' : test.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => navigate('instructions')}
              className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              <Play className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => navigate('results')}
              className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Results
            </button>
            <button
              onClick={handleDeleteTest}
              className="flex items-center gap-2 px-4 py-2 rounded font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 ml-auto"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {test.published && (
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4" />
                  Public URL
                </div>
                <p className="text-xs text-gray-600 break-all mb-3 bg-gray-50 rounded p-2 font-mono">{getPublicUrl()}</p>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors w-full justify-center"
                >
                  {copiedUrl ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Details</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Questions</div>
                  <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Marks</div>
                  <div className="text-2xl font-bold text-gray-900">{test.totalMarks}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Max Attempts</div>
                  <div className="text-lg font-medium text-gray-900">{test.maxAttempts}</div>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-sm text-gray-500 mb-1">Start Time</div>
                  <div className="text-sm font-medium text-gray-900">{new Date(test.startTime).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">End Time</div>
                  <div className="text-sm font-medium text-gray-900">{new Date(test.endTime).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
                  <p className="text-sm text-gray-600">Manage test questions</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingQuestion(null);
                      setShowQuestionForm(true);
                    }}
                    disabled={importing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                  <button
                    onClick={handleImportDummyQuestions}
                    disabled={importing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        Importing... ({importProgress.current}/{importProgress.total})
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {questions.length > 0 ? (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg border hover:border-gray-400 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded">
                              {index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${question.questionType === 'MCQ' ? 'bg-blue-100 text-blue-700' :
                              question.questionType === 'MAQ' ? 'bg-purple-100 text-purple-700' :
                              question.questionType === 'TRUE_FALSE' ? 'bg-green-100 text-green-700' :
                              question.questionType === 'ESSAY' ? 'bg-yellow-100 text-yellow-700' :
                              question.questionType === 'IMAGE_BASED' ? 'bg-orange-100 text-orange-700' :
                              question.questionType === 'UPLOAD_ANSWER' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                              {question.questionType === 'MCQ' ? 'Single Choice' :
                                question.questionType === 'MAQ' ? 'Multiple Choice' :
                                question.questionType === 'TRUE_FALSE' ? 'True/False' :
                                question.questionType === 'ESSAY' ? 'Essay' :
                                question.questionType === 'IMAGE_BASED' ? 'Image Based' :
                                question.questionType === 'UPLOAD_ANSWER' ? 'File Upload' : 'Fill Blank'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {question.marks} marks
                              {question.negativeMarks > 0 && ` · -${question.negativeMarks}`}
                            </span>
                          </div>

                          <p className="font-medium text-gray-900 mb-3">{question.questionText}</p>

                          {(question.questionType === 'MCQ' || question.questionType === 'MAQ') && (
                            <div className="space-y-2 ml-10">
                              {['A', 'B', 'C', 'D'].map((opt) => {
                                const optionText = question[`option${opt}` as keyof Question];
                                if (!optionText) return null;

                                const isCorrect = question.questionType === 'MCQ'
                                  ? question.correctOption === opt
                                  : question.correctOptionsCsv?.includes(opt);

                                return (
                                  <div key={opt} className={`flex items-center gap-2 p-2 rounded ${isCorrect ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-medium ${isCorrect ? 'bg-green-600 text-white' : 'bg-white border text-gray-600'}`}>
                                      {opt}
                                    </span>
                                    <span className={`flex-1 text-sm ${isCorrect ? 'font-medium text-green-900' : 'text-gray-700'}`}>
                                      {optionText}
                                    </span>
                                    {isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {question.questionType === 'FILL_BLANK' && (
                            <div className="ml-10 p-2 bg-green-50 rounded text-sm">
                              <span className="font-medium text-green-900">Answer: </span>
                              <span className="text-green-700">{question.correctAnswer}</span>
                            </div>
                          )}

                          {question.questionType === 'TRUE_FALSE' && (
                            <div className="space-y-2 ml-13">
                              {['A', 'B'].map((opt) => {
                                const optionText = question[`option${opt}` as keyof Question];
                                if (!optionText) return null;

                                const isCorrect = question.correctOption === opt;

                                return (
                                  <div key={opt} className={`flex items-center space-x-3 p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-surface'
                                    }`}>
                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-white text-text-secondary border border-border'
                                      }`}>
                                      {opt}
                                    </span>
                                    <span className={`flex-1 ${isCorrect ? 'font-medium text-green-900' : 'text-text'}`}>
                                      {optionText}
                                    </span>
                                    {isCorrect && (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {question.questionType === 'ESSAY' && (
                            <div className="ml-13 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <span className="text-sm font-semibold text-yellow-900">Essay Question</span>
                              {question.characterLimit && (
                                <span className="text-sm text-yellow-700 ml-2">· Character limit: {question.characterLimit}</span>
                              )}
                            </div>
                          )}

                          {question.questionType === 'IMAGE_BASED' && (
                            <div className="ml-13 space-y-3">
                              {question.imageUrl && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                  <span className="text-sm font-semibold text-orange-900">Image: </span>
                                  <span className="text-sm text-orange-700">{question.imageUrl}</span>
                                </div>
                              )}
                              <div className="space-y-2">
                                {['A', 'B', 'C', 'D'].map((opt) => {
                                  const optionText = question[`option${opt}` as keyof Question];
                                  if (!optionText) return null;

                                  const isCorrect = question.correctOption === opt;

                                  return (
                                    <div key={opt} className={`flex items-center space-x-3 p-3 rounded-lg ${isCorrect ? 'bg-orange-50 border border-orange-200' : 'bg-surface'
                                      }`}>
                                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${isCorrect ? 'bg-orange-500 text-white' : 'bg-white text-text-secondary border border-border'
                                        }`}>
                                        {opt}
                                      </span>
                                      <span className={`flex-1 ${isCorrect ? 'font-medium text-orange-900' : 'text-text'}`}>
                                        {optionText}
                                      </span>
                                      {isCorrect && (
                                        <CheckCircle className="w-5 h-5 text-orange-600" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {question.questionType === 'UPLOAD_ANSWER' && (
                            <div className="ml-13 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                              <span className="text-sm font-semibold text-indigo-900">File Upload Required</span>
                              {question.fileUploadInstructions && (
                                <div className="text-sm text-indigo-700 mt-1">
                                  Instructions: {question.fileUploadInstructions}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingQuestion(question);
                              setShowQuestionForm(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-8 text-center">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-600 mb-4">Start building your test by adding questions</p>
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowQuestionForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <QuestionFormModal
          testId={parseInt(id!)}
          question={editingQuestion}
          onSuccess={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
            fetchData();
          }}
          onCancel={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {/* Edit Test Modal */}
      {showEditModal && test && (
        <EditTestModal
          test={test}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleUpdateTest}
        />
      )}

      {/* Dummy Questions Modal */}
      {/* (If needed in future, logic is currently inline in handleImportDummyQuestions button) */}
    </div>
  );
};

export default TestDetailPage;