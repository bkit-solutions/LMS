package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class TopicDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTopicRequest {
        @NotBlank
        private String title;
        private String description;
        private Boolean published;
        private Integer displayOrder;
        private Long courseId; // Required - topic belongs to a course
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTopicRequest {
        private String title;
        private String description;
        private Boolean published;
        private Integer displayOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicResponse {
        private Long id;
        private String title;
        private String description;
        private Boolean published;
        private Integer displayOrder;
        private Long courseId;
        private String courseTitle;
        private Long createdById;
        private String createdByName;
        private Long collegeId;
        private String collegeName;
        private String createdAt;
        private String updatedAt;
        private Integer chapterCount;
    }
}
