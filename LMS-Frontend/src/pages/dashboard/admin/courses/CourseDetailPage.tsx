import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseApi } from "@/services/courseApi";
import { topicApi } from "@/services/topicApi";
import { enrollmentApi } from "@/services/enrollmentApi";
import type {
  CourseDetailResponse,
  CourseStatsResponse,
  TopicWithChaptersResponse,
  UpdateCourseRequest,
  TopicResponse,
} from "@/types";

type Tab = "overview" | "curriculum" | "enrollment" | "settings";

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = Number(id);

  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [stats, setStats] = useState<CourseStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateCourseRequest>({});

  // Add existing topic state
  const [showAddExistingTopic, setShowAddExistingTopic] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<TopicResponse[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [addingTopic, setAddingTopic] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, statsRes] = await Promise.all([
        courseApi.getCourseDetail(courseId),
        courseApi.getCourseStats(courseId),
      ]);
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
        setEditForm({
          title: courseRes.data.title,
          courseCode: courseRes.data.courseCode,
          description: courseRes.data.description,
          category: courseRes.data.category,
          department: courseRes.data.department,
          semester: courseRes.data.semester,
          credits: courseRes.data.credits,
          difficultyLevel: courseRes.data.difficultyLevel,
          estimatedHours: courseRes.data.estimatedHours,
          maxEnrollment: courseRes.data.maxEnrollment,
          prerequisites: courseRes.data.prerequisites,
          learningObjectives: courseRes.data.learningObjectives,
          tags: courseRes.data.tags,
        });
      }
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpdate = async () => {
    try {
      await courseApi.updateCourse(courseId, editForm);
      setEditing(false);
      flashSuccess("Course updated successfully");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update course");
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      if (course.published) await courseApi.unpublishCourse(courseId);
      else await courseApi.publishCourse(courseId);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update publish status");
    }
  };

  const handleToggleEnrollment = async () => {
    if (!course) return;
    try {
      await courseApi.toggleEnrollment(courseId, !course.enrollmentOpen);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to toggle enrollment");
    }
  };

  const handleClone = async () => {
    try {
      await courseApi.cloneCourse(courseId);
      flashSuccess("Course cloned successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clone course");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this course permanently? This action cannot be undone.")) return;
    try {
      await courseApi.deleteCourse(courseId);
      navigate("../courses");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  // Topic management - add existing
  const handleShowAddExistingTopic = async () => {
    setShowAddExistingTopic(true);
    setSelectedTopicId(null);
    setSearchTerm("");
    try {
      setLoadingTopics(true);
      const response = await topicApi.getMyTopics();
      if (response.success && response.data) {
        // Filter out topics that are already in this course
        const existingTopicIds = new Set(course?.topics?.map(t => t.id) || []);
        const available = response.data.filter(topic => !existingTopicIds.has(topic.id));
        setAvailableTopics(available);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load available topics");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleAddExistingTopic = async () => {
    if (!selectedTopicId) return;
    try {
      setAddingTopic(true);
      await courseApi.addTopicToCourse(courseId, selectedTopicId);
      setShowAddExistingTopic(false);
      setSelectedTopicId(null);
      flashSuccess("Module added to course");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add module to course");
    } finally {
      setAddingTopic(false);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm("Remove this module from the course? The module and its lessons will still exist but won't be part of this course.")) return;
    try {
      await courseApi.removeTopicFromCourse(courseId, topicId);
      flashSuccess("Module removed from course");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove module from course");
    }
  };

  const handleReorderTopic = async (topicId: number, direction: "up" | "down") => {
    if (!course?.topics) return;
    const topics = [...course.topics];
    const idx = topics.findIndex((t) => t.id === topicId);
    if (direction === "up" && idx <= 0) return;
    if (direction === "down" && idx >= topics.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;

    // Swap display orders via update
    try {
      await topicApi.updateTopic(topics[idx].id, { displayOrder: swapIdx + 1 });
      await topicApi.updateTopic(topics[swapIdx].id, { displayOrder: idx + 1 });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reorder modules");
    }
  };

  const handleCreateNewTopic = () => {
    if (!course) return;
    navigate(`/${window.location.pathname.split("/")[1]}/dashboard/topics/create?courseId=${course.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold">Course not found</p>
          <button onClick={() => navigate("../courses")} className="mt-4 text-primary underline">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "curriculum", label: `Curriculum (${course.topics?.length || 0} modules)` },
    { key: "enrollment", label: `Enrollment (${course.enrollmentCount})` },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate("../courses")}
          className="text-primary hover:text-secondary text-sm font-medium mb-4 inline-block"
        >
          &larr; Back to Courses
        </button>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{success}</div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-text">{course.title}</h1>
                {course.courseCode && (
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {course.courseCode}
                  </span>
                )}
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    course.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : course.status === "ARCHIVED"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {course.status || (course.published ? "Published" : "Draft")}
                </span>
                {course.enrollmentOpen && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Enrollment Open
                  </span>
                )}
              </div>
              {course.description && <p className="text-text-secondary text-sm">{course.description}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {course.category && (
                  <span className="text-xs bg-surface px-2 py-0.5 rounded text-text-secondary">{course.category}</span>
                )}
                {course.department && (
                  <span className="text-xs bg-indigo-50 px-2 py-0.5 rounded text-indigo-700">{course.department}</span>
                )}
                {course.semester && (
                  <span className="text-xs bg-purple-50 px-2 py-0.5 rounded text-purple-700">Sem {course.semester}</span>
                )}
                {course.credits && (
                  <span className="text-xs bg-blue-50 px-2 py-0.5 rounded text-blue-700">{course.credits} credits</span>
                )}
                {course.difficultyLevel && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      course.difficultyLevel === "BEGINNER"
                        ? "bg-green-50 text-green-700"
                        : course.difficultyLevel === "INTERMEDIATE"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {course.difficultyLevel}
                  </span>
                )}
                {course.estimatedHours && (
                  <span className="text-xs bg-surface px-2 py-0.5 rounded text-text-secondary">
                    {course.estimatedHours}h
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTogglePublish}
                className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${
                  course.published
                    ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                    : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                }`}
              >
                {course.published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={handleToggleEnrollment}
                className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${
                  course.enrollmentOpen
                    ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                {course.enrollmentOpen ? "Close Enrollment" : "Open Enrollment"}
              </button>
              <button
                onClick={handleClone}
                className="text-xs px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium border border-indigo-200"
              >
                Clone
              </button>
            </div>
          </div>

          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-border">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{stats.totalTopics}</p>
                <p className="text-xs text-text-secondary">Topics</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{stats.totalChapters}</p>
                <p className="text-xs text-text-secondary">Chapters</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{stats.totalEnrollments}</p>
                <p className="text-xs text-text-secondary">Enrollments</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">{stats.activeEnrollments}</p>
                <p className="text-xs text-text-secondary">Active</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-indigo-600">{stats.completedEnrollments}</p>
                <p className="text-xs text-text-secondary">Completed</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab course={course} />}
        {activeTab === "curriculum" && (
          <CurriculumTab
            course={course}
            showAddExistingTopic={showAddExistingTopic}
            onShowAddExistingTopic={handleShowAddExistingTopic}
            onCloseAddExistingTopic={() => {
              setShowAddExistingTopic(false);
              setSelectedTopicId(null);
            }}
            availableTopics={availableTopics}
            loadingTopics={loadingTopics}
            selectedTopicId={selectedTopicId}
            onSelectedTopicIdChange={setSelectedTopicId}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            addingTopic={addingTopic}
            onAddExistingTopic={handleAddExistingTopic}
            onDeleteTopic={handleDeleteTopic}
            onReorderTopic={handleReorderTopic}
            onNavigateToTopic={(topicId) => navigate(`/${window.location.pathname.split("/")[1]}/dashboard/courses/${course.id}/topics/${topicId}/edit`)}
            onCreateNewTopic={handleCreateNewTopic}
          />
        )}
        {activeTab === "enrollment" && <EnrollmentTab course={course} />}
        {activeTab === "settings" && (
          <SettingsTab
            course={course}
            editing={editing}
            editForm={editForm}
            onEdit={() => setEditing(true)}
            onCancel={() => {
              setEditing(false);
              setEditForm({
                title: course.title,
                courseCode: course.courseCode,
                description: course.description,
                category: course.category,
                department: course.department,
                semester: course.semester,
                credits: course.credits,
                difficultyLevel: course.difficultyLevel,
                estimatedHours: course.estimatedHours,
                maxEnrollment: course.maxEnrollment,
                prerequisites: course.prerequisites,
                learningObjectives: course.learningObjectives,
                tags: course.tags,
              });
            }}
            onSave={handleUpdate}
            onFormChange={(changes) => setEditForm({ ...editForm, ...changes })}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

// --- Overview Tab ---
const OverviewTab: React.FC<{ course: CourseDetailResponse }> = ({ course }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {course.prerequisites && (
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-text mb-2">Prerequisites</h3>
        <p className="text-sm text-text-secondary whitespace-pre-wrap">{course.prerequisites}</p>
      </div>
    )}
    {course.learningObjectives && (
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-text mb-2">Learning Objectives</h3>
        <p className="text-sm text-text-secondary whitespace-pre-wrap">{course.learningObjectives}</p>
      </div>
    )}
    {course.tags && (
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-text mb-2">Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {course.tags.split(",").map((tag, i) => (
            <span key={i} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {tag.trim()}
            </span>
          ))}
        </div>
      </div>
    )}
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold text-text mb-2">Course Info</h3>
      <dl className="text-sm space-y-2">
        <div className="flex justify-between">
          <dt className="text-text-secondary">Created By</dt>
          <dd className="text-text font-medium">{course.createdByName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">College</dt>
          <dd className="text-text font-medium">{course.collegeName}</dd>
        </div>
        {course.courseCode && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Course Code</dt>
            <dd className="text-text font-medium font-mono">{course.courseCode}</dd>
          </div>
        )}
        {course.department && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Department</dt>
            <dd className="text-text font-medium">{course.department}</dd>
          </div>
        )}
        {course.semester && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Semester</dt>
            <dd className="text-text font-medium">{course.semester}</dd>
          </div>
        )}
        {course.credits && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Credits</dt>
            <dd className="text-text font-medium">{course.credits}</dd>
          </div>
        )}
        {course.createdAt && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Created</dt>
            <dd className="text-text">{new Date(course.createdAt).toLocaleDateString()}</dd>
          </div>
        )}
        {course.updatedAt && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Updated</dt>
            <dd className="text-text">{new Date(course.updatedAt).toLocaleDateString()}</dd>
          </div>
        )}
        {course.maxEnrollment && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">Max Enrollment</dt>
            <dd className="text-text font-medium">{course.maxEnrollment}</dd>
          </div>
        )}
      </dl>
    </div>
  </div>
);

// --- Curriculum Tab ---
interface CurriculumTabProps {
  course: CourseDetailResponse;
  showAddExistingTopic: boolean;
  onShowAddExistingTopic: () => void;
  onCloseAddExistingTopic: () => void;
  availableTopics: TopicResponse[];
  loadingTopics: boolean;
  selectedTopicId: number | null;
  onSelectedTopicIdChange: (id: number | null) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  addingTopic: boolean;
  onAddExistingTopic: () => void;
  onDeleteTopic: (topicId: number) => void;
  onReorderTopic: (topicId: number, dir: "up" | "down") => void;
  onNavigateToTopic: (topicId: number) => void;
  onCreateNewTopic: () => void;
}

const CurriculumTab: React.FC<CurriculumTabProps> = ({
  course,
  showAddExistingTopic,
  onShowAddExistingTopic,
  onCloseAddExistingTopic,
  availableTopics,
  loadingTopics,
  selectedTopicId,
  onSelectedTopicIdChange,
  searchTerm,
  onSearchTermChange,
  addingTopic,
  onAddExistingTopic,
  onDeleteTopic,
  onReorderTopic,
  onNavigateToTopic,
  onCreateNewTopic,
}) => {
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

  const totalChapters = course.topics?.reduce((sum, t) => sum + (t.chapterCount || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text">Course Curriculum</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {course.topics?.length || 0} modules &middot; {totalChapters} lessons
          </p>
        </div>
        <button
          onClick={onShowAddExistingTopic}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
        >
          + Add Module
        </button>
      </div>

      {/* Inline Add Existing Module Form */}
      {showAddExistingTopic && (
        <div className="bg-white rounded-xl border-2 border-primary/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-text">Add Module to Course</h4>
            <button onClick={onCloseAddExistingTopic} className="text-text-secondary hover:text-text text-lg">&times;</button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search existing topics..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>

          {/* Create New Topic Button */}
          <div className="mb-4">
            <button
              onClick={onCreateNewTopic}
              className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
            >
              + Create New Topic
            </button>
          </div>

          {/* Available Topics List */}
          <div className="max-h-60 overflow-y-auto">
            {(() => {
              const filteredTopics = availableTopics.filter(topic =>
                topic.title.toLowerCase().includes(searchTerm.toLowerCase())
              );
              
              return loadingTopics ? (
                <div className="text-center py-4 text-text-secondary">Loading topics...</div>
              ) : filteredTopics.length === 0 ? (
                <div className="text-center py-4 text-text-secondary">
                  {searchTerm ? "No topics match your search" : "No topics available"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectedTopicIdChange(topic.id)}
                    >
                      <div>
                        <div className="font-medium text-text text-sm">{topic.title}</div>
                        <div className="text-xs text-text-secondary">
                          {topic.chapterCount} lessons • {topic.published ? 'Published' : 'Draft'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={selectedTopicId === topic.id}
                          onChange={() => onSelectedTopicIdChange(topic.id)}
                          className="w-4 h-4 text-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-border">
            <button
              onClick={onCloseAddExistingTopic}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAddExistingTopic}
              disabled={!selectedTopicId || addingTopic}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium disabled:opacity-50"
            >
              {addingTopic ? "Adding..." : "Add Selected Topic"}
            </button>
          </div>
        </div>
      )}

      {/* Module List with Chapters */}
      {!course.topics || course.topics.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-text-secondary font-medium">No modules in this course yet</p>
          <p className="text-text-secondary text-sm mt-1">Click "Add Module" to start building your curriculum</p>
        </div>
      ) : (
        <div className="space-y-3">
          {course.topics.map((topic: TopicWithChaptersResponse, idx: number) => (
            <div key={topic.id} className="bg-white rounded-xl border border-border overflow-hidden">
              {/* Module Header */}
              <div className="px-5 py-4 flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                >
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-text">{topic.title}</h4>
                    <p className="text-xs text-text-secondary">
                      {topic.chapterCount} lessons &middot;{" "}
                      <span className={topic.published ? "text-green-600" : "text-yellow-600"}>
                        {topic.published ? "Published" : "Draft"}
                      </span>
                    </p>
                  </div>
                  <span className="text-text-secondary text-lg ml-2">
                    {expandedTopic === topic.id ? "▼" : "▶"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onReorderTopic(topic.id, "up")}
                    disabled={idx === 0}
                    className="p-1.5 text-text-secondary hover:text-text disabled:opacity-30 rounded"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => onReorderTopic(topic.id, "down")}
                    disabled={idx === course.topics!.length - 1}
                    className="p-1.5 text-text-secondary hover:text-text disabled:opacity-30 rounded"
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => onNavigateToTopic(topic.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteTopic(topic.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Expanded Lessons */}
              {expandedTopic === topic.id && topic.chapters && topic.chapters.length > 0 && (
                <div className="border-t border-border bg-gray-50">
                  {topic.chapters.map((chapter, cIdx) => (
                    <div
                      key={chapter.id}
                      className="px-5 py-3 flex items-center gap-3 border-b border-border last:border-b-0"
                    >
                      <span className="w-6 h-6 bg-gray-200 text-text-secondary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {cIdx + 1}
                      </span>
                      <div className="flex-1">
                        <span className="text-sm text-text">{chapter.title}</span>
                        {chapter.contentType && chapter.contentType !== "TEXT" && (
                          <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                            {chapter.contentType}
                          </span>
                        )}
                      </div>
                      {chapter.estimatedMinutes && (
                        <span className="text-xs text-text-secondary">{chapter.estimatedMinutes}min</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {expandedTopic === topic.id && (!topic.chapters || topic.chapters.length === 0) && (
                <div className="border-t border-border bg-gray-50 p-4 text-center text-sm text-text-secondary">
                  No lessons in this module yet.{" "}
                  <button
                    onClick={() => onNavigateToTopic(topic.id)}
                    className="text-primary underline"
                  >
                    Add lessons
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Enrollment Tab ---
const EnrollmentTab: React.FC<{ course: CourseDetailResponse }> = ({ course }) => {
  const [enrollments, setEnrollments] = React.useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = React.useState(true);
  const [enrollmentError, setEnrollmentError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchEnrollments();
  }, [course.id]);

  const fetchEnrollments = async () => {
    try {
      setLoadingEnrollments(true);
      const response = await enrollmentApi.getCourseEnrollments(course.id);
      if (response.success && response.data) {
        setEnrollments(response.data);
      }
    } catch (err: any) {
      setEnrollmentError(err.response?.data?.message || "Failed to load enrollments");
    } finally {
      setLoadingEnrollments(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{course.enrollmentCount}</p>
          <p className="text-xs text-blue-600">Total Enrolled</p>
        </div>
        <div className="bg-surface rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-text">{course.maxEnrollment || "∞"}</p>
          <p className="text-xs text-text-secondary">Max Allowed</p>
        </div>
        <div className="bg-surface rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-text">
            {course.enrollmentOpen ? "Open" : "Closed"}
          </p>
          <p className="text-xs text-text-secondary">Status</p>
        </div>
        <div className="bg-surface rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-text">
            {course.maxEnrollment
              ? Math.max(0, course.maxEnrollment - course.enrollmentCount)
              : "∞"}
          </p>
          <p className="text-xs text-text-secondary">Spots Left</p>
        </div>
      </div>

      {/* Enrolled Students List */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Enrolled Students</h3>
          <button
            onClick={fetchEnrollments}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-secondary transition-colors font-medium"
          >
            Refresh
          </button>
        </div>

        {loadingEnrollments ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-text-secondary text-sm mt-2">Loading enrollments...</p>
          </div>
        ) : enrollmentError ? (
          <div className="p-8 text-center">
            <p className="text-red-600 text-sm">{enrollmentError}</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-text-secondary">No students enrolled yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Enrolled On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">
                        {enrollment.studentName || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">
                        {enrollment.studentEmail || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          enrollment.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : enrollment.status === "ACTIVE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${enrollment.progressPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary">
                          {enrollment.progressPercentage || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {enrollment.enrolledAt
                        ? new Date(enrollment.enrolledAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Settings Tab ---
interface SettingsTabProps {
  course: CourseDetailResponse;
  editing: boolean;
  editForm: UpdateCourseRequest;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFormChange: (changes: Partial<UpdateCourseRequest>) => void;
  onDelete: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  course,
  editing,
  editForm,
  onEdit,
  onCancel,
  onSave,
  onFormChange,
  onDelete,
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Course Settings</h3>
        {!editing && (
          <button
            onClick={onEdit}
            className="text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary transition-colors font-medium"
          >
            Edit Course
          </button>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
            <input
              type="text"
              value={editForm.title || ""}
              onChange={(e) => onFormChange({ title: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Course Code</label>
            <input
              type="text"
              value={editForm.courseCode || ""}
              onChange={(e) => onFormChange({ courseCode: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              placeholder="e.g., CS101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Department</label>
            <input
              type="text"
              value={editForm.department || ""}
              onChange={(e) => onFormChange({ department: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Computer Science"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea
              value={editForm.description || ""}
              onChange={(e) => onFormChange({ description: e.target.value })}
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
            <input
              type="text"
              value={editForm.category || ""}
              onChange={(e) => onFormChange({ category: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Difficulty</label>
            <select
              value={editForm.difficultyLevel || "BEGINNER"}
              onChange={(e) => onFormChange({ difficultyLevel: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Semester</label>
            <input
              type="text"
              value={editForm.semester || ""}
              onChange={(e) => onFormChange({ semester: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g., Fall 2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Credits</label>
            <input
              type="number"
              value={editForm.credits || ""}
              onChange={(e) => onFormChange({ credits: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Estimated Hours</label>
            <input
              type="number"
              value={editForm.estimatedHours || ""}
              onChange={(e) => onFormChange({ estimatedHours: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Max Enrollment</label>
            <input
              type="number"
              value={editForm.maxEnrollment || ""}
              onChange={(e) => onFormChange({ maxEnrollment: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              min={1}
              placeholder="Unlimited if empty"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Prerequisites</label>
            <textarea
              value={editForm.prerequisites || ""}
              onChange={(e) => onFormChange({ prerequisites: e.target.value })}
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Learning Objectives</label>
            <textarea
              value={editForm.learningObjectives || ""}
              onChange={(e) => onFormChange({ learningObjectives: e.target.value })}
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Tags</label>
            <input
              type="text"
              value={editForm.tags || ""}
              onChange={(e) => onFormChange({ tags: e.target.value })}
              className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Comma-separated tags"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="bg-primary text-white px-8 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Title", value: course.title },
            { label: "Course Code", value: course.courseCode || "—" },
            { label: "Department", value: course.department || "—" },
            { label: "Semester", value: course.semester || "—" },
            { label: "Credits", value: course.credits || "—" },
            { label: "Category", value: course.category || "—" },
            { label: "Difficulty", value: course.difficultyLevel || "—" },
            { label: "Estimated Hours", value: course.estimatedHours ? `${course.estimatedHours}h` : "—" },
            { label: "Max Enrollment", value: course.maxEnrollment || "Unlimited" },
            { label: "Status", value: course.status || (course.published ? "PUBLISHED" : "DRAFT") },
            { label: "Tags", value: course.tags || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-border">
              <dt className="text-text-secondary">{label}</dt>
              <dd className="text-text font-medium">{value}</dd>
            </div>
          ))}
          {course.prerequisites && (
            <div className="md:col-span-2 border-b border-border py-2">
              <dt className="text-text-secondary mb-1">Prerequisites</dt>
              <dd className="text-text">{course.prerequisites}</dd>
            </div>
          )}
          {course.learningObjectives && (
            <div className="md:col-span-2 border-b border-border py-2">
              <dt className="text-text-secondary mb-1">Learning Objectives</dt>
              <dd className="text-text">{course.learningObjectives}</dd>
            </div>
          )}
        </dl>
      )}
    </div>

    {/* Danger Zone */}
    <div className="bg-white rounded-xl border border-red-200 p-6">
      <h3 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h3>
      <p className="text-sm text-text-secondary mb-4">
        Deleting this course will permanently remove all associated data including enrollments. This cannot be undone.
      </p>
      <button
        onClick={onDelete}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
      >
        Delete Course Permanently
      </button>
    </div>
  </div>
);

export default CourseDetailPage;
