package in.bkitsolutions.lmsbackend.dto;

import in.bkitsolutions.lmsbackend.model.QuestionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class QuestionDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateQuestionRequest {
        @NotNull
        private QuestionType questionType; // MCQ (single), MAQ (multiple), or FILL_BLANK

        @NotBlank
        private String questionText;

        private Integer marks; // default 1
        private Integer negativeMarks; // default 0

        // For MCQ/MAQ options
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;

        // For MCQ single-correct
        private String correctOption; // A/B/C/D (use only with MCQ)

        // For MAQ multiple-correct (and supported for legacy MCQ multi-correct)
        private String correctOptionsCsv; // e.g., "A,B"

        // For fill-in-the-blank
        private String correctAnswer;
    }
}
