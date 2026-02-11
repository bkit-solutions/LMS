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
}
