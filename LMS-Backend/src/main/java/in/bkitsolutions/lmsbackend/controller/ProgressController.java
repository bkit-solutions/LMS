package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/chapters/{chapterId}/complete")
    public ResponseEntity<ApiResponse<Void>> markComplete(Authentication auth, @PathVariable Long chapterId) {
        String email = (String) auth.getPrincipal();
        progressService.markChapterCompleted(email, chapterId);
        return ResponseEntity.ok(ApiResponse.ok("Chapter marked as completed", null));
    }

    @PostMapping("/chapters/{chapterId}/time")
    public ResponseEntity<ApiResponse<Void>> updateTime(
            Authentication auth,
            @PathVariable Long chapterId,
            @RequestBody Map<String, Long> body) {
        String email = (String) auth.getPrincipal();
        Long seconds = body.getOrDefault("seconds", 0L);
        progressService.updateTimeSpent(email, chapterId, seconds);
        return ResponseEntity.ok(ApiResponse.ok("Time updated", null));
    }

    @GetMapping("/chapters/{chapterId}/status")
    public ResponseEntity<ApiResponse<Boolean>> getStatus(Authentication auth, @PathVariable Long chapterId) {
        String email = (String) auth.getPrincipal();
        boolean completed = progressService.isChapterCompleted(email, chapterId);
        return ResponseEntity.ok(ApiResponse.ok("Status retrieved", completed));
    }
}
