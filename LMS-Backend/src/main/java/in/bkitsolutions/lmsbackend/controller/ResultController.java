package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.AttemptDtos;
import in.bkitsolutions.lmsbackend.model.TestAttempt;
import in.bkitsolutions.lmsbackend.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ResultController {
    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    // Admin: list all results for my tests; Superadmin: list all
    @GetMapping("/admin/results")
    public ResponseEntity<ApiResponse<List<AttemptDtos.ResultDto>>> adminAll(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<AttemptDtos.ResultDto> list = resultService.adminAllResults(email);
        return ResponseEntity.ok(ApiResponse.ok("Results", list));
    }

    // Admin or Superadmin: results for a specific test
    @GetMapping("/admin/tests/{testId}/results")
    public ResponseEntity<ApiResponse<List<AttemptDtos.ResultDto>>> adminForTest(Authentication auth, @PathVariable Long testId) {
        String email = (String) auth.getPrincipal();
        List<AttemptDtos.ResultDto> list = resultService.adminTestResults(email, testId);
        return ResponseEntity.ok(ApiResponse.ok("Results for test", list));
    }

    // Student: my own attempts and scores
    @GetMapping("/me/results")
    public ResponseEntity<ApiResponse<List<AttemptDtos.ResultDto>>> myResults(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<AttemptDtos.ResultDto> list = resultService.myResults(email);
        return ResponseEntity.ok(ApiResponse.ok("My results", list));
    }

    @DeleteMapping("/results/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        resultService.deleteResult(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Result deleted"));
    }
}
