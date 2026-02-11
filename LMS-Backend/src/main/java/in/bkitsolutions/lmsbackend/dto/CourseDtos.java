package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CourseDtos {

    @Data
    public static class CreateCourseRequest {
        @NotBlank
        @Size(max = 255)
        private String title;

        private String description;
        private String thumbnailUrl;
        private Boolean published;
        private Boolean enrollmentOpen;
        private Integer maxEnrollment;
        private Integer displayOrder;
        private String category;
        private String difficultyLevel;
        private Integer estimatedHours;
        private List<Long> topicIds;
        private List<Long> testIds;
    }

    @Data
    public static class UpdateCourseRequest {
        private String title;
        private String description;
        private String thumbnailUrl;
        private Boolean published;
        private Boolean enrollmentOpen;
        private Integer maxEnrollment;
        private Integer displayOrder;
        private String category;
        private String difficultyLevel;
        private Integer estimatedHours;
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
        private String description;
        private String thumbnailUrl;
        private Long createdById;
        private String createdByName;
        private Long collegeId;
        private String collegeName;
        private Boolean published;
        private Boolean enrollmentOpen;
        private Integer maxEnrollment;
        private Integer displayOrder;
        private String category;
        private String difficultyLevel;
        private Integer estimatedHours;
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
        private String description;
        private String thumbnailUrl;
        private Long createdById;
        private String createdByName;
        private Long collegeId;
        private String collegeName;
        private Boolean published;
        private Boolean enrollmentOpen;
        private String category;
        private String difficultyLevel;
        private Integer estimatedHours;
        private String createdAt;
        private String updatedAt;
        private List<TopicDtos.TopicResponse> topics;
        private long enrollmentCount;
        private boolean isEnrolled;
        private Integer progressPercentage;
    }
}
