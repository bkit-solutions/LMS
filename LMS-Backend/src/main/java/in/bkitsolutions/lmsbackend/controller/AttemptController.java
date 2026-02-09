package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.AttemptDtos;
import in.bkitsolutions.lmsbackend.model.Answer;
import in.bkitsolutions.lmsbackend.model.TestAttempt;
import in.bkitsolutions.lmsbackend.service.AttemptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AttemptController {
    private final AttemptService attemptService;

    public AttemptController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping("/tests/{testId}/attempts")
    public ResponseEntity<ApiResponse<TestAttempt>> startAttempt(Authentication auth,
                                                                 @PathVariable Long testId,
                                                                 @Valid @RequestBody(required = false) AttemptDtos.StartAttemptRequest req) {
        String email = (String) auth.getPrincipal();
        TestAttempt attempt = attemptService.startAttempt(email, testId);
        // As per requirement: return 200 OK even when updating existing attempt
        return ResponseEntity.ok(ApiResponse.ok("Attempt started", attempt));
    }

    @PostMapping("/attempts/{attemptId}/answers")
    public ResponseEntity<ApiResponse<Answer>> submitAnswer(Authentication auth,
                                                            @PathVariable Long attemptId,
                                                            @Valid @RequestBody AttemptDtos.SubmitAnswerRequest req) {
        String email = (String) auth.getPrincipal();
        attemptService.submitOrUpdateAnswer(email, attemptId, req.getQuestionId(), req.getAnswerText());
        return ResponseEntity.ok(ApiResponse.ok("Answer saved successfully"));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<ApiResponse<TestAttempt>> submitAttempt(Authentication auth, @PathVariable Long attemptId) {
        String email = (String) auth.getPrincipal();
        TestAttempt ta = attemptService.submitAttempt(email, attemptId);
        return ResponseEntity.ok(ApiResponse.ok("Attempt submitted", ta));
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<ApiResponse<TestAttempt>> getAttempt(Authentication auth, @PathVariable Long attemptId) {
        String email = (String) auth.getPrincipal();
        TestAttempt ta = attemptService.getAttempt(email, attemptId);
        return ResponseEntity.ok(ApiResponse.ok("Attempt", ta));
    }

    // Resume endpoint (new): get full attempt state using current user (from JWT) + testId
    // This avoids needing attemptId on the client side.
    @GetMapping("/tests/{testId}/attempts/me/state")
    public ResponseEntity<ApiResponse<AttemptDtos.AttemptStateResponse>> getMyAttemptState(Authentication auth,
                                                                                           @PathVariable Long testId) {
        String email = (String) auth.getPrincipal();
        AttemptDtos.AttemptStateResponse state = attemptService.getAttemptStateByTest(email, testId);
        return ResponseEntity.ok(ApiResponse.ok("Attempt state", state));
    }

    // Discover endpoint: latest attempt for current user on a test (optionally only incomplete)
    @GetMapping("/tests/{testId}/attempts/me/latest")
    public ResponseEntity<ApiResponse<TestAttempt>> getLatestAttemptForMe(Authentication auth,
                                                                          @PathVariable Long testId,
                                                                          @RequestParam(name = "onlyIncomplete", required = false, defaultValue = "true") boolean onlyIncomplete) {
        String email = (String) auth.getPrincipal();
        return attemptService.getLatestAttemptForUser(email, testId, onlyIncomplete)
                .map(attempt -> ResponseEntity.ok(ApiResponse.ok("Latest attempt", attempt)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("No attempt found")));
    }
}
