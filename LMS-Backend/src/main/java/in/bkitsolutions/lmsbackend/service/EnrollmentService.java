package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.EnrollmentDtos;
import in.bkitsolutions.lmsbackend.model.*;
import in.bkitsolutions.lmsbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ChapterProgressRepository chapterProgressRepository;
    private final ChapterRepository chapterRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, CourseRepository courseRepository,
                             UserRepository userRepository, ChapterProgressRepository chapterProgressRepository,
                             ChapterRepository chapterRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.chapterProgressRepository = chapterProgressRepository;
        this.chapterRepository = chapterRepository;
    }

    public EnrollmentDtos.EnrollmentResponse enroll(String studentEmail, Long courseId) {
        User student = requireUser(studentEmail);
        if (student.getType() != UserType.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can enroll in courses");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getPublished()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course is not published");
        }
        if (!course.getEnrollmentOpen()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enrollment is closed for this course");
        }

        // Check college match
        if (student.getCollege() == null || !student.getCollege().getId().equals(course.getCollege().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only enroll in courses from your college");
        }

        if (enrollmentRepository.existsByCourseIdAndStudentId(courseId, student.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already enrolled in this course");
        }

        // Check max enrollment
        if (course.getMaxEnrollment() != null) {
            long count = enrollmentRepository.countByCourseId(courseId);
            if (count >= course.getMaxEnrollment()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course enrollment is full");
            }
        }

        Enrollment enrollment = Enrollment.builder()
                .course(course)
                .student(student)
                .status(EnrollmentStatus.ACTIVE)
                .progressPercentage(0)
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return toResponse(enrollment);
    }

    public void unenroll(String studentEmail, Long courseId) {
        User student = requireUser(studentEmail);
        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));
        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
    }

    public List<EnrollmentDtos.EnrollmentResponse> getMyEnrollments(String studentEmail) {
        User student = requireUser(studentEmail);
        return enrollmentRepository.findByStudentId(student.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<EnrollmentDtos.EnrollmentResponse> getCourseEnrollments(String requesterEmail, Long courseId) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // Only course creator, admin of same college, or superadmin can view enrollments
        if (requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            if (requester.getType() == UserType.ADMIN || requester.getType() == UserType.FACULTY) {
                if (requester.getCollege() == null || !requester.getCollege().getId().equals(course.getCollege().getId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
                }
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
            }
        }

        return enrollmentRepository.findByCourseId(courseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public EnrollmentDtos.ProgressResponse getProgress(String studentEmail, Long courseId) {
        User student = requireUser(studentEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not enrolled in this course"));

        // Calculate progress from chapter completions
        int totalChapters = 0;
        int completedChapters = 0;
        if (course.getTopics() != null) {
            for (Topic topic : course.getTopics()) {
                List<Chapter> chapters = chapterRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId());
                totalChapters += chapters.size();
                completedChapters += (int) chapterProgressRepository
                        .countByChapterTopicIdAndStudentIdAndCompletedTrue(topic.getId(), student.getId());
            }
        }

        int progressPercent = totalChapters > 0 ? (completedChapters * 100) / totalChapters : 0;

        // Update enrollment progress
        enrollment.setProgressPercentage(progressPercent);
        if (progressPercent >= 100 && enrollment.getStatus() == EnrollmentStatus.ACTIVE) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(LocalDateTime.now());
        }
        enrollmentRepository.save(enrollment);

        return EnrollmentDtos.ProgressResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalChapters(totalChapters)
                .completedChapters(completedChapters)
                .progressPercentage(progressPercent)
                .status(enrollment.getStatus().name())
                .build();
    }

    private EnrollmentDtos.EnrollmentResponse toResponse(Enrollment enrollment) {
        return EnrollmentDtos.EnrollmentResponse.builder()
                .id(enrollment.getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .courseThumbnailUrl(enrollment.getCourse().getThumbnailUrl())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getName())
                .studentEmail(enrollment.getStudent().getEmail())
                .status(enrollment.getStatus().name())
                .enrolledAt(enrollment.getEnrolledAt() != null ? enrollment.getEnrolledAt().toString() : null)
                .completedAt(enrollment.getCompletedAt() != null ? enrollment.getCompletedAt().toString() : null)
                .progressPercentage(enrollment.getProgressPercentage())
                .build();
    }

    // --- Admin Enrollment Management ---

    /**
     * Admin/Faculty can enroll a student into a course (batch enrollment)
     */
    public EnrollmentDtos.EnrollmentResponse adminEnrollStudent(String requesterEmail, Long courseId, Long studentId) {
        User requester = requireUser(requesterEmail);
        verifyAdminAccess(requester);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // Verify requester has access to this course's college
        verifyCollegeAccess(requester, course);

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        if (student.getType() != UserType.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only enroll student users");
        }

        if (enrollmentRepository.existsByCourseIdAndStudentId(courseId, studentId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student already enrolled");
        }

        Enrollment enrollment = Enrollment.builder()
                .course(course)
                .student(student)
                .status(EnrollmentStatus.ACTIVE)
                .progressPercentage(0)
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return toResponse(enrollment);
    }

    /**
     * Bulk enroll multiple students into a course
     */
    public List<EnrollmentDtos.EnrollmentResponse> adminBulkEnroll(String requesterEmail, Long courseId, List<Long> studentIds) {
        User requester = requireUser(requesterEmail);
        verifyAdminAccess(requester);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyCollegeAccess(requester, course);

        return studentIds.stream()
                .filter(studentId -> !enrollmentRepository.existsByCourseIdAndStudentId(courseId, studentId))
                .map(studentId -> {
                    User student = userRepository.findById(studentId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student " + studentId + " not found"));
                    if (student.getType() != UserType.USER) return null;

                    Enrollment enrollment = Enrollment.builder()
                            .course(course)
                            .student(student)
                            .status(EnrollmentStatus.ACTIVE)
                            .progressPercentage(0)
                            .build();
                    return toResponse(enrollmentRepository.save(enrollment));
                })
                .filter(r -> r != null)
                .collect(Collectors.toList());
    }

    /**
     * Admin can remove a student from a course
     */
    public void adminUnenrollStudent(String requesterEmail, Long courseId, Long studentId) {
        User requester = requireUser(requesterEmail);
        verifyAdminAccess(requester);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyCollegeAccess(requester, course);

        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
    }

    /**
     * Admin can update enrollment status (ACTIVE, COMPLETED, DROPPED, SUSPENDED)
     */
    public EnrollmentDtos.EnrollmentResponse adminUpdateEnrollmentStatus(String requesterEmail, Long enrollmentId, String status) {
        User requester = requireUser(requesterEmail);
        verifyAdminAccess(requester);

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enrollment not found"));

        verifyCollegeAccess(requester, enrollment.getCourse());

        try {
            EnrollmentStatus newStatus = EnrollmentStatus.valueOf(status.toUpperCase());
            enrollment.setStatus(newStatus);
            if (newStatus == EnrollmentStatus.COMPLETED) {
                enrollment.setCompletedAt(LocalDateTime.now());
                enrollment.setProgressPercentage(100);
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }

        enrollment = enrollmentRepository.save(enrollment);
        return toResponse(enrollment);
    }

    /**
     * Get enrollment statistics for a college
     */
    public EnrollmentDtos.EnrollmentStatsResponse getEnrollmentStats(String requesterEmail, Long collegeId) {
        User requester = requireUser(requesterEmail);
        verifyAdminAccess(requester);

        // Verify college access
        if (requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            if (requester.getCollege() == null || !requester.getCollege().getId().equals(collegeId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        }

        long totalEnrollments = enrollmentRepository.countByCollegeId(collegeId);
        List<Course> courses = courseRepository.findByCollegeId(collegeId);

        long activeEnrollments = 0;
        long completedEnrollments = 0;
        long droppedEnrollments = 0;

        for (Course course : courses) {
            activeEnrollments += enrollmentRepository.countByCourseIdAndStatus(course.getId(), EnrollmentStatus.ACTIVE);
            completedEnrollments += enrollmentRepository.countByCourseIdAndStatus(course.getId(), EnrollmentStatus.COMPLETED);
            droppedEnrollments += enrollmentRepository.countByCourseIdAndStatus(course.getId(), EnrollmentStatus.DROPPED);
        }

        double completionRate = totalEnrollments > 0 ? (double) completedEnrollments / totalEnrollments * 100 : 0;

        return EnrollmentDtos.EnrollmentStatsResponse.builder()
                .totalEnrollments(totalEnrollments)
                .activeEnrollments(activeEnrollments)
                .completedEnrollments(completedEnrollments)
                .droppedEnrollments(droppedEnrollments)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .totalCourses(courses.size())
                .build();
    }

    // --- Helper Methods ---

    private void verifyAdminAccess(User user) {
        if (user.getType() != UserType.ADMIN && user.getType() != UserType.FACULTY
                && user.getType() != UserType.SUPERADMIN && user.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
        }
    }

    private void verifyCollegeAccess(User requester, Course course) {
        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) return;
        if (requester.getCollege() == null || !requester.getCollege().getId().equals(course.getCollege().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this course's college");
        }
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
