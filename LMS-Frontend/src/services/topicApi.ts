import api from "./apiClient";
import type { ApiResponse } from "./authApi";
import type {
  TopicResponse,
  CreateTopicRequest,
  UpdateTopicRequest,
  ChapterResponse,
  ChapterSummary,
  CreateChapterRequest,
  UpdateChapterRequest,
} from "../types";

export const topicApi = {
  // Admin: get topics created by the logged-in admin
  getMyTopics: async (): Promise<ApiResponse<TopicResponse[]>> => {
    const response = await api.get("/api/topics/mine");
    return response.data;
  },

  // All users: get published topics visible to the user
  getPublishedTopics: async (): Promise<ApiResponse<TopicResponse[]>> => {
    const response = await api.get("/api/topics/published");
    return response.data;
  },

  // Get a single topic by ID
  getTopicById: async (id: number): Promise<ApiResponse<TopicResponse>> => {
    const response = await api.get(`/api/topics/${id}`);
    return response.data;
  },

  // Admin: create a new topic
  createTopic: async (
    data: CreateTopicRequest,
  ): Promise<ApiResponse<TopicResponse>> => {
    const response = await api.post("/api/topics", data);
    return response.data;
  },

  // Admin: update a topic
  updateTopic: async (
    id: number,
    data: UpdateTopicRequest,
  ): Promise<ApiResponse<TopicResponse>> => {
    const response = await api.patch(`/api/topics/${id}`, data);
    return response.data;
  },

  // Admin: publish a topic
  publishTopic: async (id: number): Promise<ApiResponse<TopicResponse>> => {
    const response = await api.patch(`/api/topics/${id}/publish`);
    return response.data;
  },

  // Admin: unpublish a topic
  unpublishTopic: async (id: number): Promise<ApiResponse<TopicResponse>> => {
    const response = await api.patch(`/api/topics/${id}/unpublish`);
    return response.data;
  },

  // Admin: delete a topic
  deleteTopic: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/topics/${id}`);
    return response.data;
  },

  // Get topics by college (SuperAdmin)
  getTopicsByCollege: async (collegeId: number): Promise<ApiResponse<TopicResponse[]>> => {
    const response = await api.get(`/api/topics/college/${collegeId}`);
    return response.data;
  },

  // Get topics by course (curriculum)
  getTopicsByCourse: async (courseId: number): Promise<ApiResponse<TopicResponse[]>> => {
    const response = await api.get(`/api/topics/course/${courseId}`);
    return response.data;
  },

  // Get chapters list (summaries) for a topic
  getChaptersByTopic: async (
    topicId: number,
  ): Promise<ApiResponse<ChapterSummary[]>> => {
    const response = await api.get(`/api/topics/${topicId}/chapters`);
    return response.data;
  },

  // Get a single chapter with full content
  getChapterById: async (
    chapterId: number,
  ): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.get(`/api/chapters/${chapterId}`);
    return response.data;
  },

  // Admin: create a chapter in a topic
  createChapter: async (
    topicId: number,
    data: CreateChapterRequest,
  ): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.post(`/api/topics/${topicId}/chapters`, data);
    return response.data;
  },

  // Admin: update a chapter
  updateChapter: async (
    chapterId: number,
    data: UpdateChapterRequest,
  ): Promise<ApiResponse<ChapterResponse>> => {
    const response = await api.patch(`/api/chapters/${chapterId}`, data);
    return response.data;
  },

  // Admin: delete a chapter
  deleteChapter: async (chapterId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/chapters/${chapterId}`);
    return response.data;
  },
};
