import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseApi } from "@/services/courseApi";
import { enrollmentApi } from "@/services/enrollmentApi";
import { ChevronRight, BookOpen, Clock, CheckCircle2, Circle, BarChart3 } from "lucide-react";
import type { CourseDetailResponse, ProgressResponse } from "@/types";

const StudentCourseViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = Number(id);

  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "progress">("overview");
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, progressRes] = await Promise.all([
        courseApi.getCourseDetail(courseId),
        enrollmentApi.getProgress(courseId).catch(() => ({ success: false, data: null })),
      ]);
      
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        // Auto-expand first topic
        if (courseRes.data.topics && courseRes.data.topics.length > 0) {
          setExpandedTopics(new Set([courseRes.data.topics[0].id]));
        }

        // Fetch completion status for all chapters
        if (courseRes.data.topics) {
          const chapterIds: number[] = [];
          courseRes.data.topics.forEach(topic => {
            if (topic.chapters) {
              topic.chapters.forEach(chapter => chapterIds.push(chapter.id));
            }
          });

          // Fetch completion status for all chapters
          const completionPromises = chapterIds.map(id => 
            enrollmentApi.getChapterStatus(id).catch(() => ({ success: false, data: false }))
          );
          
          const completionResults = await Promise.all(completionPromises);
          const completedSet = new Set<number>();
          
          completionResults.forEach((result, index) => {
            if (result.success && result.data) {
              completedSet.add(chapterIds[index]);
            }
          });
          
          setCompletedChapters(completedSet);
        }
      }
      if (progressRes.success && progressRes.data) {
        setProgress(progressRes.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Course not found - redirect to 404 page with original path
        navigate("/404", { 
          replace: true, 
          state: { originalPath: window.location.pathname } 
        });
        return;
      }
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: number) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleViewTopic = (topicId: number) => {
    // Use absolute path to avoid navigation issues
    const collegeCode = window.location.pathname.split("/")[1];
    navigate(`/${collegeCode}/dashboard/topics/${topicId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !course) {
    const collegeCode = window.location.pathname.split("/")[1];
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-2">Error</h2>
          <p className="text-text-secondary mb-4">{error || "Course not found"}</p>
          <button
            onClick={() => navigate(`/${collegeCode}/dashboard/courses`)}
            className="text-primary hover:underline"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const completedChaptersCount = progress?.completedChapters || 0;
  const totalChapters = course.topics?.reduce((sum, topic) => sum + (topic.chapterCount || 0), 0) || 0;
  const progressPercentage = totalChapters > 0 ? Math.round((completedChaptersCount / totalChapters) * 100) : 0;
  const collegeCode = window.location.pathname.split("/")[1];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/${collegeCode}/dashboard/courses`)}
          className="text-primary hover:text-secondary text-sm font-medium mb-4 inline-block"
        >
          ← Back to My Courses
        </button>

        {/* Course Header */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 mb-6 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              {course.description && (
                <p className="text-white/90 text-lg mb-4">{course.description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {course.category && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    📚 {course.category}
                  </span>
                )}
                {course.difficultyLevel && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    🎯 {course.difficultyLevel}
                  </span>
                )}
                {course.estimatedHours && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    ⏱️ {course.estimatedHours} hours
                  </span>
                )}
              </div>
            </div>
            {/* Progress Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
              <p className="text-white/80 text-sm mb-2">Your Progress</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl font-bold">{progressPercentage}%</div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-white/70 text-xs mt-2">
                {completedChapters.size} of {totalChapters} chapters completed
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-border p-1">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "overview"
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-text hover:bg-gray-50"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "curriculum"
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-text hover:bg-gray-50"
                  }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "progress"
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-text hover:bg-gray-50"
                  }`}
                >
                  My Progress
                </button>
              </div>
            </div>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold text-text mb-4">Course Overview</h2>
                {course.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text mb-2">Description</h3>
                    <p className="text-text-secondary leading-relaxed">{course.description}</p>
                  </div>
                )}
                {course.learningObjectives && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text mb-2">Learning Objectives</h3>
                    <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                      {course.learningObjectives}
                    </div>
                  </div>
                )}
                {course.prerequisites && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text mb-2">Prerequisites</h3>
                    <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                      {course.prerequisites}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Course Curriculum
                </h2>

                {!course.topics || course.topics.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-text-secondary">No content available yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.topics.map((topic, topicIndex) => (
                      <div
                        key={topic.id}
                        className="border border-border rounded-lg overflow-hidden"
                      >
                        {/* Topic Header */}
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                            expandedTopics.has(topic.id) ? "bg-primary/5" : "bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => toggleTopic(topic.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {topicIndex + 1}
                            </span>
                            <div>
                              <h3 className="font-semibold text-text">{topic.title}</h3>
                              <p className="text-xs text-text-secondary mt-0.5">
                                {topic.chapterCount} chapters
                                {topic.published && (
                                  <span className="ml-2 text-green-600">• Available</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTopic(topic.id);
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-secondary transition-colors font-medium"
                            >
                              Start Learning
                            </button>
                            <ChevronRight
                              className={`w-5 h-5 text-text-secondary transition-transform ${
                                expandedTopics.has(topic.id) ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Chapters List */}
                        {expandedTopics.has(topic.id) && topic.chapters && topic.chapters.length > 0 && (
                          <div className="border-t border-border bg-gray-50">
                            {topic.chapters.map((chapter, chapterIndex) => {
                              const isCompleted = completedChapters.has(chapter.id);
                              return (
                                <div
                                  key={chapter.id}
                                  className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-white transition-colors"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                  )}
                                  <span className="w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {chapterIndex + 1}
                                  </span>
                                  <span className={`text-sm flex-1 ${isCompleted ? "text-text" : "text-text-secondary"}`}>
                                    {chapter.title}
                                  </span>
                                  {chapter.estimatedMinutes && (
                                    <span className="text-xs text-text-secondary flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {chapter.estimatedMinutes}m
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="text-xs text-green-600 font-medium">Completed</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {expandedTopics.has(topic.id) && (!topic.chapters || topic.chapters.length === 0) && (
                          <div className="border-t border-border bg-gray-50 p-4 text-center text-sm text-text-secondary">
                            No chapters available yet
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === "progress" && (
              <div className="space-y-4">
                {/* Progress Summary */}
                <div className="bg-white rounded-xl border border-border p-6">
                  <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Learning Progress
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
                      <div className="text-sm text-blue-700">Overall Progress</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{completedChapters.size}</div>
                      <div className="text-sm text-green-700">Chapters Completed</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{totalChapters - completedChapters.size}</div>
                      <div className="text-sm text-orange-700">Chapters Remaining</div>
                    </div>
                  </div>

                  {/* Progress by Topic */}
                  <h3 className="text-lg font-semibold text-text mb-3">Progress by Topic</h3>
                  <div className="space-y-3">
                    {course.topics?.map((topic) => {
                      const topicChapters = topic.chapters || [];
                      const completedInTopic = topicChapters.filter(ch => completedChapters.has(ch.id)).length;
                      const topicProgress = topicChapters.length > 0 ? Math.round((completedInTopic / topicChapters.length) * 100) : 0;
                      
                      return (
                        <div key={topic.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-text">{topic.title}</h4>
                            <span className="text-sm text-text-secondary">
                              {completedInTopic}/{topicChapters.length} chapters
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${topicProgress}%` }}
                            />
                          </div>
                          <div className="text-xs text-text-secondary mt-1">{topicProgress}% complete</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Course Info */}
          <div className="space-y-4">
            {/* Learning Objectives */}
            {course.learningObjectives && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                  🎯 Learning Objectives
                </h3>
                <div className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {course.learningObjectives}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                  📋 Prerequisites
                </h3>
                <div className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {course.prerequisites}
                </div>
              </div>
            )}

            {/* Course Stats */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text mb-3">Course Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Topics</span>
                  <span className="font-medium text-text">{course.topics?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Total Chapters</span>
                  <span className="font-medium text-text">{totalChapters}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Completed</span>
                  <span className="font-medium text-green-600">{completedChapters.size}</span>
                </div>
                {course.estimatedHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Estimated Time</span>
                    <span className="font-medium text-text">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {course.estimatedHours}h
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {course.tags && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-text mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.split(",").map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseViewPage;
