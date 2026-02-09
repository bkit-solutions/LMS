package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.TestDtos;
import in.bkitsolutions.lmsbackend.model.TestEntity;
import in.bkitsolutions.lmsbackend.service.TestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
public class TestController {
    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TestEntity>> create(Authentication auth,
                                                          @Valid @RequestBody TestDtos.CreateTestRequest req) {
        String email = (String) auth.getPrincipal();
        TestEntity t = testService.createTest(email, req.getTitle(), req.getDescription(),
                req.getStartTime(), req.getEndTime(), req.getTotalMarks(), req.getPublished(), req.getMaxAttempts(), req.getProctored());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Test created", t));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TestEntity>> update(Authentication auth,
                                                          @PathVariable Long id,
                                                          @Valid @RequestBody TestDtos.UpdateTestRequest req) {
        String email = (String) auth.getPrincipal();
        TestEntity t = testService.updateTimesAndMeta(email, id, req.getTitle(), req.getDescription(),
                req.getStartTime(), req.getEndTime(), req.getTotalMarks(), req.getMaxAttempts(), req.getProctored());
        return ResponseEntity.ok(ApiResponse.ok("Test updated", t));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<TestEntity>> publish(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        TestEntity t = testService.publish(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Test published", t));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<TestEntity>>> mine(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<TestEntity> tests = testService.myTests(email);
        return ResponseEntity.ok(ApiResponse.ok("My tests", tests));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<TestEntity>>> available(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<TestEntity> tests = testService.availableForStudent(email);
        return ResponseEntity.ok(ApiResponse.ok("Available tests", tests));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        testService.deleteTest(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Test deleted"));
    }
}
