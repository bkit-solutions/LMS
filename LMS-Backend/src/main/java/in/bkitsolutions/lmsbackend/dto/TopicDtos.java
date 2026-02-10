package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
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
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicResponse {
        private Long id;
        private String title;
        private String description;
        private Boolean published;
        private Integer displayOrder;
        private Long createdById;
        private String createdByName;
        private String createdAt;
        private String updatedAt;
        private Integer chapterCount;
    }
}
