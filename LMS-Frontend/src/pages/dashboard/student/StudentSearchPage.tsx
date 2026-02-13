import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, FileText, GraduationCap, Clock, Users } from "lucide-react";
import { courseApi } from "../../../services/courseApi";
import { topicApi } from "../../../services/topicApi";
import type { CourseResponse, TopicResponse } from "../../../types";

interface SearchResult {
  id: number;
  title: string;
  description?: string;
  type: 'course' | 'topic';
  courseId?: number;
  courseTitle?: string;
  metadata?: {
    enrollmentCount?: number;
    chapterCount?: number;
    estimatedHours?: number;
    difficultyLevel?: string;
  };
}

const StudentSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [topics, setTopics] = useState<TopicResponse[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [coursesRes, topicsRes] = await Promise.all([
        courseApi.getPublishedCourses(),
        topicApi.getPublishedTopics(),
      ]);

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      }
      if (topicsRes.success && topicsRes.data) {
        setTopics(topicsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const lowerQuery = searchQuery.toLowerCase();

      // Search courses
      courses.forEach(course => {
        if (
          course.title.toLowerCase().includes(lowerQuery) ||
          course.description?.toLowerCase().includes(lowerQuery) ||
          course.category?.toLowerCase().includes(lowerQuery) ||
          course.tags?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: course.id,
            title: course.title,
            description: course.description,
            type: 'course',
            metadata: {
              enrollmentCount: course.enrollmentCount,
              estimatedHours: course.estimatedHours,
              difficultyLevel: course.difficultyLevel,
            }
          });
        }
      });

      // Search topics
      topics.forEach(topic => {
        if (
          topic.title.toLowerCase().includes(lowerQuery) ||
          topic.description?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: topic.id,
            title: topic.title,
            description: topic.description,
            type: 'topic',
            courseId: topic.courseId,
            courseTitle: topic.courseTitle,
            metadata: {
              chapterCount: topic.chapterCount,
            }
          });
        }
      });

      setResults(searchResults);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleResultClick = (result: SearchResult) => {
    const collegeCode = window.location.pathname.split("/")[1];
    if (result.type === 'course') {
      navigate(`/${collegeCode}/dashboard/courses/${result.id}`);
    } else if (result.type === 'topic') {
      navigate(`/${collegeCode}/dashboard/topics/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-2">Search Learning Content</h1>
          <p className="text-text-secondary">Find courses, topics, and learning materials</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for courses, topics, or keywords..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </form>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Searching...</p>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No results found</h3>
            <p className="text-text-secondary">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text">
                Search Results ({results.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {result.type === 'course' ? (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors truncate">
                          {result.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.type === 'course'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {result.type}
                        </span>
                      </div>

                      {result.courseTitle && result.type === 'topic' && (
                        <p className="text-sm text-text-secondary mb-2">
                          Course: {result.courseTitle}
                        </p>
                      )}

                      {result.description && (
                        <p className="text-text-secondary mb-3 line-clamp-2">
                          {result.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        {result.metadata?.enrollmentCount && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {result.metadata.enrollmentCount} enrolled
                          </span>
                        )}
                        {result.metadata?.chapterCount && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {result.metadata.chapterCount} chapters
                          </span>
                        )}
                        {result.metadata?.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {result.metadata.estimatedHours}h
                          </span>
                        )}
                        {result.metadata?.difficultyLevel && (
                          <span className="px-2 py-1 bg-surface rounded text-xs">
                            {result.metadata.difficultyLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="text-primary group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Searches / Suggestions when no query */}
        {!query && !loading && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-text mb-4">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Programming', 'Data Science', 'Web Development', 'Machine Learning', 'Design', 'Business'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setQuery(category);
                    performSearch(category);
                  }}
                  className="p-4 bg-white border border-border rounded-lg hover:shadow-md transition-all text-left group"
                >
                  <h3 className="font-medium text-text group-hover:text-primary transition-colors">
                    {category}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Explore {category.toLowerCase()} courses
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSearchPage;