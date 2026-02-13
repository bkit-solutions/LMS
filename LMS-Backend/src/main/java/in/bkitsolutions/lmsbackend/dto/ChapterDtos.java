package in.bkitsolutions.lmsbackend.dto;

import in.bkitsolutions.lmsbackend.model.ContentType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class ChapterDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateChapterRequest {
        @NotBlank
        private String title;
        private String content;
        private ContentType contentType;
        private String videoUrl;
        private String videoPlatform;
        private String documentUrl;
        private String documentName;
        private String documentType;
        private Long testId;
        private Integer estimatedMinutes;
        private Boolean isMandatory;
        private Integer displayOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateChapterRequest {
        private String title;
        private String content;
        private ContentType contentType;
        private String videoUrl;
        private String videoPlatform;
        private String documentUrl;
        private String documentName;
        private String documentType;
        private Long testId;
        private Integer estimatedMinutes;
        private Boolean isMandatory;
        private Integer displayOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterResponse {
        private Long id;
        private String title;
        private String content;
        private ContentType contentType;
        private String videoUrl;
        private String videoPlatform;
        private String documentUrl;
        private String documentName;
        private String documentType;
        private Long testId;
        private Integer estimatedMinutes;
        private Boolean isMandatory;
        private Long topicId;
        private Integer displayOrder;
        private String createdAt;
        private String updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterSummary {
        private Long id;
        private String title;
        private ContentType contentType;
        private Integer estimatedMinutes;
        private Boolean isMandatory;
        private Integer displayOrder;
    }
}
