package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.CourseDtos;
import in.bkitsolutions.lmsbackend.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> create(
            Authentication auth,
            @Valid @RequestBody CourseDtos.CreateCourseRequest req) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.createCourse(email, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Course created", course));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> update(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody CourseDtos.UpdateCourseRequest req) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.updateCourse(email, id, req);
        return ResponseEntity.ok(ApiResponse.ok("Course updated", course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        courseService.deleteCourse(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Course deleted", null));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<CourseDtos.CourseResponse>>> mine(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<CourseDtos.CourseResponse> courses = courseService.getMyCourses(email);
        return ResponseEntity.ok(ApiResponse.ok("Courses retrieved", courses));
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<CourseDtos.CourseResponse>>> published(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<CourseDtos.CourseResponse> courses = courseService.getPublishedCourses(email);
        return ResponseEntity.ok(ApiResponse.ok("Published courses retrieved", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDtos.CourseDetailResponse>> detail(
            Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseDetailResponse course = courseService.getCourseDetail(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Course detail retrieved", course));
    }

    // --- Publish / Unpublish ---

    @PatchMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> publish(
            Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.publishCourse(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Course published", course));
    }

    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> unpublish(
            Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.unpublishCourse(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Course unpublished", course));
    }

    // --- Toggle Enrollment ---

    @PatchMapping("/{id}/enrollment")
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> toggleEnrollment(
            Authentication auth, @PathVariable Long id,
            @RequestParam boolean open) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.toggleEnrollment(email, id, open);
        return ResponseEntity.ok(ApiResponse.ok(open ? "Enrollment opened" : "Enrollment closed", course));
    }

    // --- College-scoped ---

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<ApiResponse<List<CourseDtos.CourseResponse>>> byCollege(
            Authentication auth, @PathVariable Long collegeId) {
        String email = (String) auth.getPrincipal();
        List<CourseDtos.CourseResponse> courses = courseService.getCoursesByCollege(email, collegeId);
        return ResponseEntity.ok(ApiResponse.ok("College courses retrieved", courses));
    }

    // --- Search ---

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CourseDtos.CourseResponse>>> search(
            Authentication auth,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficultyLevel) {
        String email = (String) auth.getPrincipal();
        List<CourseDtos.CourseResponse> courses = courseService.searchCourses(email, keyword, category, difficultyLevel);
        return ResponseEntity.ok(ApiResponse.ok("Search results", courses));
    }

    // --- Statistics ---

    @GetMapping("/{id}/stats")
    public ResponseEntity<ApiResponse<CourseDtos.CourseStatsResponse>> stats(
            Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseStatsResponse stats = courseService.getCourseStats(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Course statistics", stats));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<CourseDtos.DashboardStatsResponse>> dashboardStats(Authentication auth) {
        String email = (String) auth.getPrincipal();
        CourseDtos.DashboardStatsResponse stats = courseService.getDashboardStats(email);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics", stats));
    }

    // --- Clone ---

    @PostMapping("/{id}/clone")
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> clone(
            Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.cloneCourse(email, id);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Course cloned", course));
    }

    // --- Curriculum Management ---
    // DEPRECATED: Topics now belong directly to courses via course_id foreign key
    // Topics are created with courseId, no manual linking needed
    
    /*
    @PostMapping("/{courseId}/topics/{topicId}")
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> addTopic(
            Authentication auth, @PathVariable Long courseId, @PathVariable Long topicId) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.addTopicToCourse(email, courseId, topicId);
        return ResponseEntity.ok(ApiResponse.ok("Topic added to course", course));
    }

    @DeleteMapping("/{courseId}/topics/{topicId}")
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> removeTopic(
            Authentication auth, @PathVariable Long courseId, @PathVariable Long topicId) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.removeTopicFromCourse(email, courseId, topicId);
        return ResponseEntity.ok(ApiResponse.ok("Topic removed from course", course));
    }

    @PutMapping("/{courseId}/topics/reorder")
    public ResponseEntity<ApiResponse<CourseDtos.CourseResponse>> reorderTopics(
            Authentication auth, @PathVariable Long courseId,
            @RequestBody List<Long> topicIds) {
        String email = (String) auth.getPrincipal();
        CourseDtos.CourseResponse course = courseService.reorderTopics(email, courseId, topicIds);
        return ResponseEntity.ok(ApiResponse.ok("Topics reordered", course));
    }
    */
}
