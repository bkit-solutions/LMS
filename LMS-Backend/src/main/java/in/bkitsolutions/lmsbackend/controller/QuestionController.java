package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.QuestionDtos;
import in.bkitsolutions.lmsbackend.model.Question;
import in.bkitsolutions.lmsbackend.model.QuestionType;
import in.bkitsolutions.lmsbackend.service.QuestionService;
import in.bkitsolutions.lmsbackend.service.TestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuestionController {
    private final QuestionService questionService;
    private final TestService testService;

    public QuestionController(QuestionService questionService, TestService testService) {
        this.questionService = questionService;
        this.testService = testService;
    }

    @PostMapping("/tests/{testId}/questions")
    public ResponseEntity<ApiResponse<Question>> addQuestion(Authentication auth,
                                                             @PathVariable Long testId,
                                                             @Valid @RequestBody QuestionDtos.CreateQuestionRequest req) {
        String email = (String) auth.getPrincipal();
        Question q = fromDto(req);
        Question saved = questionService.addQuestion(email, testId, q);
        testService.recalculateTotalMarks(testId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Question created", saved));
    }

    @GetMapping("/tests/{testId}/questions")
    public ResponseEntity<ApiResponse<List<Question>>> listQuestions(Authentication auth, @PathVariable Long testId) {
        String email = (String) auth.getPrincipal();
        List<Question> list = questionService.listQuestions(email, testId);
        return ResponseEntity.ok(ApiResponse.ok("Questions", list));
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<Question>> updateQuestion(Authentication auth,
                                                                @PathVariable Long questionId,
                                                                @Valid @RequestBody QuestionDtos.CreateQuestionRequest req) {
        String email = (String) auth.getPrincipal();
        Question patch = fromDto(req);
        Question updated = questionService.updateQuestion(email, questionId, patch);
        testService.recalculateTotalMarks(updated.getTest().getId());
        return ResponseEntity.ok(ApiResponse.ok("Question updated", updated));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(Authentication auth, @PathVariable Long questionId) {
        String email = (String) auth.getPrincipal();
        Long testId = questionService.deleteQuestion(email, questionId);
        testService.recalculateTotalMarks(testId);
        return ResponseEntity.ok(ApiResponse.ok("Question deleted"));
    }

    private Question fromDto(QuestionDtos.CreateQuestionRequest req) {
        return Question.builder()
                .questionType(req.getQuestionType())
                .questionText(req.getQuestionText())
                .marks(req.getMarks())
                .negativeMarks(req.getNegativeMarks())
                .optionA(req.getOptionA())
                .optionB(req.getOptionB())
                .optionC(req.getOptionC())
                .optionD(req.getOptionD())
                .correctOption(req.getCorrectOption())
                .correctOptionsCsv(req.getCorrectOptionsCsv())
                .correctAnswer(req.getCorrectAnswer())
                .build();
    }
}
