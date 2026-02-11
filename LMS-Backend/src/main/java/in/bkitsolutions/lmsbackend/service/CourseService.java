package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.CourseDtos;
import in.bkitsolutions.lmsbackend.dto.TopicDtos;
import in.bkitsolutions.lmsbackend.model.*;
import in.bkitsolutions.lmsbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final TopicRepository topicRepository;
    private final TestRepository testRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository,
                         CollegeRepository collegeRepository, TopicRepository topicRepository,
                         TestRepository testRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.topicRepository = topicRepository;
        this.testRepository = testRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public CourseDtos.CourseResponse createCourse(String requesterEmail, CourseDtos.CreateCourseRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.FACULTY) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Admin or Faculty can create courses");
        }
        if (requester.getCollege() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User must belong to a college");
        }

        Course course = Course.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .thumbnailUrl(req.getThumbnailUrl())
                .createdBy(requester)
                .college(requester.getCollege())
                .published(req.getPublished() != null ? req.getPublished() : false)
                .enrollmentOpen(req.getEnrollmentOpen() != null ? req.getEnrollmentOpen() : true)
                .maxEnrollment(req.getMaxEnrollment())
                .displayOrder(req.getDisplayOrder())
                .category(req.getCategory())
                .difficultyLevel(req.getDifficultyLevel())
                .estimatedHours(req.getEstimatedHours())
                .build();

        // Link topics if provided
        if (req.getTopicIds() != null && !req.getTopicIds().isEmpty()) {
            List<Topic> topics = topicRepository.findAllById(req.getTopicIds());
            course.setTopics(topics);
        }

        // Link tests if provided
        if (req.getTestIds() != null && !req.getTestIds().isEmpty()) {
            List<TestEntity> tests = testRepository.findAllById(req.getTestIds());
            course.setTests(tests);
        }

        course = courseRepository.save(course);
        return toResponse(course);
    }

    public CourseDtos.CourseResponse updateCourse(String requesterEmail, Long courseId,
                                                   CourseDtos.UpdateCourseRequest req) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        verifyAccess(requester, course);

        if (req.getTitle() != null) course.setTitle(req.getTitle());
        if (req.getDescription() != null) course.setDescription(req.getDescription());
        if (req.getThumbnailUrl() != null) course.setThumbnailUrl(req.getThumbnailUrl());
        if (req.getPublished() != null) course.setPublished(req.getPublished());
        if (req.getEnrollmentOpen() != null) course.setEnrollmentOpen(req.getEnrollmentOpen());
        if (req.getMaxEnrollment() != null) course.setMaxEnrollment(req.getMaxEnrollment());
        if (req.getDisplayOrder() != null) course.setDisplayOrder(req.getDisplayOrder());
        if (req.getCategory() != null) course.setCategory(req.getCategory());
        if (req.getDifficultyLevel() != null) course.setDifficultyLevel(req.getDifficultyLevel());
        if (req.getEstimatedHours() != null) course.setEstimatedHours(req.getEstimatedHours());
        if (req.getTopicIds() != null) {
            List<Topic> topics = topicRepository.findAllById(req.getTopicIds());
            course.setTopics(topics);
        }
        if (req.getTestIds() != null) {
            List<TestEntity> tests = testRepository.findAllById(req.getTestIds());
            course.setTests(tests);
        }

        course = courseRepository.save(course);
        return toResponse(course);
    }

    public void deleteCourse(String requesterEmail, Long courseId) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, course);
        courseRepository.delete(course);
    }

    public List<CourseDtos.CourseResponse> getMyCourses(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        List<Course> courses;
        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            courses = courseRepository.findAll();
        } else if (requester.getType() == UserType.ADMIN) {
            courses = courseRepository.findByCollegeId(requester.getCollege().getId());
        } else if (requester.getType() == UserType.FACULTY) {
            courses = courseRepository.findByCreatedById(requester.getId());
        } else {
            courses = new ArrayList<>();
        }
        return courses.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<CourseDtos.CourseResponse> getPublishedCourses(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        if (requester.getCollege() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User must belong to a college");
        }
        return courseRepository.findByCollegeIdAndPublishedTrue(requester.getCollege().getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CourseDtos.CourseDetailResponse getCourseDetail(String requesterEmail, Long courseId) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        boolean isEnrolled = enrollmentRepository.existsByCourseIdAndStudentIdAndStatus(
                courseId, requester.getId(), EnrollmentStatus.ACTIVE);

        Integer progress = null;
        if (isEnrolled) {
            Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, requester.getId())
                    .orElse(null);
            progress = enrollment != null ? enrollment.getProgressPercentage() : 0;
        }

        return CourseDtos.CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .createdById(course.getCreatedBy().getId())
                .createdByName(course.getCreatedBy().getName())
                .collegeId(course.getCollege().getId())
                .collegeName(course.getCollege().getName())
                .published(course.getPublished())
                .enrollmentOpen(course.getEnrollmentOpen())
                .category(course.getCategory())
                .difficultyLevel(course.getDifficultyLevel())
                .estimatedHours(course.getEstimatedHours())
                .createdAt(course.getCreatedAt() != null ? course.getCreatedAt().toString() : null)
                .updatedAt(course.getUpdatedAt() != null ? course.getUpdatedAt().toString() : null)
                .enrollmentCount(enrollmentRepository.countByCourseId(courseId))
                .isEnrolled(isEnrolled)
                .progressPercentage(progress)
                .build();
    }

    private void verifyAccess(User requester, Course course) {
        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) return;
        if (requester.getType() == UserType.ADMIN && 
            requester.getCollege() != null && requester.getCollege().getId().equals(course.getCollege().getId())) return;
        if ((requester.getType() == UserType.FACULTY) && 
            course.getCreatedBy().getId().equals(requester.getId())) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    private CourseDtos.CourseResponse toResponse(Course course) {
        return CourseDtos.CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .createdById(course.getCreatedBy().getId())
                .createdByName(course.getCreatedBy().getName())
                .collegeId(course.getCollege().getId())
                .collegeName(course.getCollege().getName())
                .published(course.getPublished())
                .enrollmentOpen(course.getEnrollmentOpen())
                .maxEnrollment(course.getMaxEnrollment())
                .displayOrder(course.getDisplayOrder())
                .category(course.getCategory())
                .difficultyLevel(course.getDifficultyLevel())
                .estimatedHours(course.getEstimatedHours())
                .createdAt(course.getCreatedAt() != null ? course.getCreatedAt().toString() : null)
                .updatedAt(course.getUpdatedAt() != null ? course.getUpdatedAt().toString() : null)
                .topicCount(course.getTopics() != null ? course.getTopics().size() : 0)
                .testCount(course.getTests() != null ? course.getTests().size() : 0)
                .enrollmentCount(enrollmentRepository.countByCourseId(course.getId()))
                .build();
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
