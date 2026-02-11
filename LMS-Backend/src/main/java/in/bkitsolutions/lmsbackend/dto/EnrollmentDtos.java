package in.bkitsolutions.lmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
