package in.bkitsolutions.lmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class EnrollmentDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentResponse {
        private Long id;
        private Long courseId;
        private String courseTitle;
        private String courseThumbnailUrl;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private String status;
        private String enrolledAt;
        private String completedAt;
        private Integer progressPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressResponse {
        private Long courseId;
        private String courseTitle;
        private Integer totalChapters;
        private Integer completedChapters;
        private Integer progressPercentage;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkEnrollRequest {
        private List<Long> studentIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateEnrollmentStatusRequest {
        private String status;  // ACTIVE, COMPLETED, DROPPED, SUSPENDED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentStatsResponse {
        private long totalEnrollments;
        private long activeEnrollments;
        private long completedEnrollments;
        private long droppedEnrollments;
        private double completionRate;
        private long totalCourses;
    }
}
