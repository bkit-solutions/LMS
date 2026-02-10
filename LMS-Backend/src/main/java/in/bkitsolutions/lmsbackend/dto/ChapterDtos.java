package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
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
        private Integer displayOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateChapterRequest {
        private String title;
        private String content;
        private Integer displayOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterResponse {
        private Long id;
        private String title;
        private String content;
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
        private Integer displayOrder;
    }
}
