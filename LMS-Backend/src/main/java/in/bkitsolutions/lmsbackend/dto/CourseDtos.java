package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class CourseDtos {

    @Data
    public static class CreateCourseRequest {
        @NotBlank
        @Size(max = 255)
        private String title;

        private String courseCode;
        private String description;
        private String thumbnailUrl;
        private Boolean published;
        private Boolean enrollmentOpen;
        private Integer maxEnrollment;
        private Integer displayOrder;
        private String category;
        private String department;
        private String semester;
        private Integer credits;
        private String difficultyLevel;
        private Integer estimatedHours;
        private String prerequisites;
        private String learningObjectives;
        private String tags;
        private String status; // DRAFT, PUBLISHED, ARCHIVED
        private Long collegeId;  // For SUPERADMIN/ROOTADMIN to specify target college
        private List<Long> topicIds;
        private List<Long> testIds;
    }

    @Data
    public static class UpdateCourseRequest {
        private String title;
        private String courseCode;
        private String description;
        private String thumbnailUrl;
        private Boolean published;
        private Boolean enrollmentOpen;
        private Integer maxEnrollment;
        private Integer displayOrder;
        private String category;
        private String department;
        private String semester;
        private Integer credits;
        private String difficultyLevel;
        private Integer estimatedHours;
        private String prerequisites;
        private String learningObjectives;
        private String tags;
        private String status; // DRAFT, PUBLISHED, ARCHIVED
        private List<Long> topicIds;
        private List<Long> testIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseResponse {
        private Long id;
        private String title;
        private String courseCode;
        private String description;
        private String thumbnailUrl;
        private Long createdById;
        private String createdByName;
        private Long collegeId;
        private String collegeName;
        private String status; // DRAFT, PUBLISHED, ARCHIVED
        private Boolean published;
        private Boolean enrollmentOpen;
        private Integer maxEnrollment;
        private Integer displayOrder;
        private String category;
        private String department;
        private String semester;
        private Integer credits;
        private String difficultyLevel;
        private Integer estimatedHours;
        private String prerequisites;
        private String learningObjectives;
        private String tags;
        private String createdAt;
        private String updatedAt;
        private int topicCount;
        private int testCount;
        private long enrollmentCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseDetailResponse {
        private Long id;
        private String title;
        private String courseCode;
        private String description;
        private String thumbnailUrl;
        private Long createdById;
        private String createdByName;
        private Long collegeId;
        private String collegeName;
        private String status; // DRAFT, PUBLISHED, ARCHIVED
        private Boolean published;
        private Boolean enrollmentOpen;
        private Integer maxEnrollment;
        private String category;
        private String department;
        private String semester;
        private Integer credits;
        private String difficultyLevel;
        private Integer estimatedHours;
        private String prerequisites;
        private String learningObjectives;
        private String tags;
        private String createdAt;
        private String updatedAt;
        private List<TopicWithChaptersResponse> topics;
        private long enrollmentCount;
        private boolean isEnrolled;
        private Integer progressPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicWithChaptersResponse {
        private Long id;
        private String title;
        private String description;
        private Boolean published;
        private Integer displayOrder;
        private Long createdById;
        private String createdByName;
        private int chapterCount;
        private List<ChapterDtos.ChapterResponse> chapters;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseStatsResponse {
        private Long courseId;
        private String courseTitle;
        private long totalEnrollments;
        private long activeEnrollments;
        private long completedEnrollments;
        private long droppedEnrollments;
        private double completionRate;
        private int totalTopics;
        private int totalChapters;
        private int totalTests;
        private Boolean published;
        private Boolean enrollmentOpen;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStatsResponse {
        private long totalCourses;
        private long publishedCourses;
        private long draftCourses;
        private long archivedCourses;
        private long totalEnrollments;
        private long activeEnrollments;
        private long completedEnrollments;
        private int totalTopics;
        private int totalChapters;
        private Map<String, Long> categoryDistribution;
        private Map<String, Long> difficultyDistribution;
        private Map<String, Long> statusDistribution;
    }
}
