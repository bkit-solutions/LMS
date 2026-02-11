package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class TestDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTestRequest {
        @NotBlank
        private String title;
        private String description;
        @NotNull
        private LocalDateTime startTime;
        @NotNull
        private LocalDateTime endTime;
        private Integer totalMarks;
        private Boolean published; // default false if not provided
        private Integer maxAttempts; // default 1 if null/0
        private Boolean proctored; // default false if not provided
        
        private Integer durationMinutes; // Test duration in minutes, null = unlimited time
        private String instructions; // Custom test instructions (TEXT)
        private Integer passingPercentage; // Minimum percentage required to pass
        private String difficultyLevel; // EASY, MEDIUM, HARD
        private Boolean showResultsImmediately; // Show results right after test submission
        private Boolean allowReview; // Allow students to review answers after submission
        private Integer maxViolations; // Maximum allowed proctoring violations
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTestRequest {
        private String title;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer totalMarks;
        private Integer maxAttempts;
        private Boolean proctored;
        private Integer durationMinutes; // Test duration in minutes, null = unlimited time
        private String instructions; // Custom test instructions (TEXT)
        private Integer passingPercentage; // Minimum percentage required to pass
        private String difficultyLevel; // EASY, MEDIUM, HARD
        private Boolean showResultsImmediately; // Show results right after test submission
        private Boolean allowReview; // Allow students to review answers after submission
        private Integer maxViolations; // Maximum allowed proctoring violations
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublishRequest {
        private Boolean published;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestResponse {
        private Long id;
        private String title;
        private String description;
        private String startTime;
        private String endTime;
        private Integer totalMarks;
        private Boolean published;
        private Integer maxAttempts;
        private UserDtos.UserResponse createdBy;
    }
}
