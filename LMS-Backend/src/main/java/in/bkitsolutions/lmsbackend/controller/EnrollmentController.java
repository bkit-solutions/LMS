package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.EnrollmentDtos;
import in.bkitsolutions.lmsbackend.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<EnrollmentDtos.EnrollmentResponse>> enroll(
            Authentication auth, @PathVariable Long courseId) {
        String email = (String) auth.getPrincipal();
        EnrollmentDtos.EnrollmentResponse enrollment = enrollmentService.enroll(email, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Enrolled successfully", enrollment));
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<Void>> unenroll(Authentication auth, @PathVariable Long courseId) {
        String email = (String) auth.getPrincipal();
        enrollmentService.unenroll(email, courseId);
        return ResponseEntity.ok(ApiResponse.ok("Unenrolled successfully", null));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<EnrollmentDtos.EnrollmentResponse>>> myEnrollments(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<EnrollmentDtos.EnrollmentResponse> enrollments = enrollmentService.getMyEnrollments(email);
        return ResponseEntity.ok(ApiResponse.ok("Enrollments retrieved", enrollments));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<List<EnrollmentDtos.EnrollmentResponse>>> courseEnrollments(
            Authentication auth, @PathVariable Long courseId) {
        String email = (String) auth.getPrincipal();
        List<EnrollmentDtos.EnrollmentResponse> enrollments = enrollmentService.getCourseEnrollments(email, courseId);
        return ResponseEntity.ok(ApiResponse.ok("Course enrollments retrieved", enrollments));
    }

    @GetMapping("/courses/{courseId}/progress")
    public ResponseEntity<ApiResponse<EnrollmentDtos.ProgressResponse>> progress(
            Authentication auth, @PathVariable Long courseId) {
        String email = (String) auth.getPrincipal();
        EnrollmentDtos.ProgressResponse progress = enrollmentService.getProgress(email, courseId);
        return ResponseEntity.ok(ApiResponse.ok("Progress retrieved", progress));
    }

    // --- Admin Enrollment Management ---

    @PostMapping("/admin/courses/{courseId}/students/{studentId}")
    public ResponseEntity<ApiResponse<EnrollmentDtos.EnrollmentResponse>> adminEnroll(
            Authentication auth, @PathVariable Long courseId, @PathVariable Long studentId) {
        String email = (String) auth.getPrincipal();
        EnrollmentDtos.EnrollmentResponse enrollment = enrollmentService.adminEnrollStudent(email, courseId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Student enrolled by admin", enrollment));
    }

    @PostMapping("/admin/courses/{courseId}/bulk-enroll")
    public ResponseEntity<ApiResponse<List<EnrollmentDtos.EnrollmentResponse>>> adminBulkEnroll(
            Authentication auth, @PathVariable Long courseId,
            @RequestBody EnrollmentDtos.BulkEnrollRequest req) {
        String email = (String) auth.getPrincipal();
        List<EnrollmentDtos.EnrollmentResponse> enrollments = enrollmentService.adminBulkEnroll(email, courseId, req.getStudentIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Students enrolled", enrollments));
    }

    @DeleteMapping("/admin/courses/{courseId}/students/{studentId}")
    public ResponseEntity<ApiResponse<Void>> adminUnenroll(
            Authentication auth, @PathVariable Long courseId, @PathVariable Long studentId) {
        String email = (String) auth.getPrincipal();
        enrollmentService.adminUnenrollStudent(email, courseId, studentId);
        return ResponseEntity.ok(ApiResponse.ok("Student unenrolled by admin", null));
    }

    @PatchMapping("/admin/{enrollmentId}/status")
    public ResponseEntity<ApiResponse<EnrollmentDtos.EnrollmentResponse>> adminUpdateStatus(
            Authentication auth, @PathVariable Long enrollmentId,
            @RequestBody EnrollmentDtos.UpdateEnrollmentStatusRequest req) {
        String email = (String) auth.getPrincipal();
        EnrollmentDtos.EnrollmentResponse enrollment = enrollmentService.adminUpdateEnrollmentStatus(email, enrollmentId, req.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Enrollment status updated", enrollment));
    }

    @GetMapping("/admin/college/{collegeId}/stats")
    public ResponseEntity<ApiResponse<EnrollmentDtos.EnrollmentStatsResponse>> enrollmentStats(
            Authentication auth, @PathVariable Long collegeId) {
        String email = (String) auth.getPrincipal();
        EnrollmentDtos.EnrollmentStatsResponse stats = enrollmentService.getEnrollmentStats(email, collegeId);
        return ResponseEntity.ok(ApiResponse.ok("Enrollment statistics", stats));
    }
}
