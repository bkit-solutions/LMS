package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AttemptDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StartAttemptRequest {
        // no body needed now; reserved for future
        private Boolean placeholder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitAnswerRequest {
        @NotNull
        private Long questionId;
        // For MCQ: "A" or "A,B"; For FILL_BLANK: free text
        @NotBlank
        private String answerText;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitAttemptRequest {
        // no body yet
        private Boolean placeholder;
    }

    // ===== Read models for resume/state =====

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttemptInfo {
        private Long id;
        private Long testId;         // Added for reference
        private Integer attemptNumber;
        private Boolean completed;
        private String startedAt;   // ISO string for simplicity in client
        private String submittedAt;  // may be null
        private String updatedAt;    // auto-updated
        private Boolean proctored;   // Whether this test requires proctoring
        private Integer durationMinutes; // Test duration in minutes, null = unlimited
        private Integer maxViolations;   // Maximum allowed violations
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionItem {
        private Long id;
        private String questionType; // enum name
        private String questionText;
        private Integer marks;
        private Integer negativeMarks;
        // MCQ/MAQ options (if applicable)
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttemptStateResponse {
        private AttemptInfo attempt;
        private java.util.List<QuestionItem> questions;
        // Map questionId -> answerText
        private java.util.Map<Long, String> answers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultDto {
        private Long id;
        private TestDtos.TestResponse test;
        private UserDtos.UserResponse student;
        private Integer attemptNumber;
        private String startedAt;
        private String submittedAt;
        private Integer score;
        private Boolean completed;
        private String updatedAt;
        private Boolean isValidTest;
    }
}
