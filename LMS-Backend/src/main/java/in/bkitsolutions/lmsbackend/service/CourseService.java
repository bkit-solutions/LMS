package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.ChapterDtos;
import in.bkitsolutions.lmsbackend.dto.CourseDtos;
import in.bkitsolutions.lmsbackend.dto.TopicDtos;
import in.bkitsolutions.lmsbackend.model.*;
import in.bkitsolutions.lmsbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final TopicRepository topicRepository;
    private final TestRepository testRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ChapterRepository chapterRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository,
                         CollegeRepository collegeRepository, TopicRepository topicRepository,
                         TestRepository testRepository, EnrollmentRepository enrollmentRepository,
                         ChapterRepository chapterRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.topicRepository = topicRepository;
        this.testRepository = testRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.chapterRepository = chapterRepository;
    }

    public CourseDtos.CourseResponse createCourse(String requesterEmail, CourseDtos.CreateCourseRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.FACULTY
                && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Admin, Faculty, or SuperAdmin can create courses");
        }
        // SUPERADMIN/ROOTADMIN can create for any college using collegeId from request
        College college;
        if ((requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) && req.getCollegeId() != null) {
            college = collegeRepository.findById(req.getCollegeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found"));
        } else {
            if (requester.getCollege() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User must belong to a college");
            }
            college = requester.getCollege();
        }

        Course course = Course.builder()
                .title(req.getTitle())
                .courseCode(req.getCourseCode())
                .description(req.getDescription())
                .thumbnailUrl(req.getThumbnailUrl())
                .createdBy(requester)
                .college(college)
                .status(req.getStatus() != null ? CourseStatus.valueOf(req.getStatus()) : CourseStatus.DRAFT)
                .published(req.getPublished() != null ? req.getPublished() : false)
                .enrollmentOpen(req.getEnrollmentOpen() != null ? req.getEnrollmentOpen() : true)
                .maxEnrollment(req.getMaxEnrollment())
                .displayOrder(req.getDisplayOrder())
                .category(req.getCategory())
                .department(req.getDepartment())
                .semester(req.getSemester())
                .credits(req.getCredits())
                .difficultyLevel(req.getDifficultyLevel())
                .estimatedHours(req.getEstimatedHours())
                .prerequisites(req.getPrerequisites())
                .learningObjectives(req.getLearningObjectives())
                .tags(req.getTags())
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
        if (req.getCourseCode() != null) course.setCourseCode(req.getCourseCode());
        if (req.getDescription() != null) course.setDescription(req.getDescription());
        if (req.getThumbnailUrl() != null) course.setThumbnailUrl(req.getThumbnailUrl());
        if (req.getStatus() != null) {
            CourseStatus newStatus = CourseStatus.valueOf(req.getStatus());
            course.setStatus(newStatus);
            course.setPublished(newStatus == CourseStatus.PUBLISHED);
        }
        if (req.getPublished() != null) course.setPublished(req.getPublished());
        if (req.getEnrollmentOpen() != null) course.setEnrollmentOpen(req.getEnrollmentOpen());
        if (req.getMaxEnrollment() != null) course.setMaxEnrollment(req.getMaxEnrollment());
        if (req.getDisplayOrder() != null) course.setDisplayOrder(req.getDisplayOrder());
        if (req.getCategory() != null) course.setCategory(req.getCategory());
        if (req.getDepartment() != null) course.setDepartment(req.getDepartment());
        if (req.getSemester() != null) course.setSemester(req.getSemester());
        if (req.getCredits() != null) course.setCredits(req.getCredits());
        if (req.getDifficultyLevel() != null) course.setDifficultyLevel(req.getDifficultyLevel());
        if (req.getEstimatedHours() != null) course.setEstimatedHours(req.getEstimatedHours());
        if (req.getPrerequisites() != null) course.setPrerequisites(req.getPrerequisites());
        if (req.getLearningObjectives() != null) course.setLearningObjectives(req.getLearningObjectives());
        if (req.getTags() != null) course.setTags(req.getTags());
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

        // Build topics with chapters (curriculum)
        List<CourseDtos.TopicWithChaptersResponse> topicResponses = new ArrayList<>();
        if (course.getTopics() != null) {
            for (Topic topic : course.getTopics()) {
                List<Chapter> chapters = chapterRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId());
                List<ChapterDtos.ChapterResponse> chapterResponses = chapters.stream()
                        .map(ch -> ChapterDtos.ChapterResponse.builder()
                                .id(ch.getId())
                                .title(ch.getTitle())
                                .content(isEnrolled || isContentManager(requester, course) ? ch.getContent() : null)
                                .topicId(topic.getId())
                                .displayOrder(ch.getDisplayOrder())
                                .createdAt(ch.getCreatedAt() != null ? ch.getCreatedAt().toString() : null)
                                .updatedAt(ch.getUpdatedAt() != null ? ch.getUpdatedAt().toString() : null)
                                .build())
                        .collect(Collectors.toList());

                topicResponses.add(CourseDtos.TopicWithChaptersResponse.builder()
                        .id(topic.getId())
                        .title(topic.getTitle())
                        .description(topic.getDescription())
                        .published(topic.getPublished())
                        .displayOrder(topic.getDisplayOrder())
                        .createdById(topic.getCreatedBy().getId())
                        .createdByName(topic.getCreatedBy().getName())
                        .chapterCount(chapters.size())
                        .chapters(chapterResponses)
                        .build());
            }
        }

        return CourseDtos.CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .courseCode(course.getCourseCode())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .createdById(course.getCreatedBy().getId())
                .createdByName(course.getCreatedBy().getName())
                .collegeId(course.getCollege().getId())
                .collegeName(course.getCollege().getName())
                .status(course.getStatus() != null ? course.getStatus().name() : "DRAFT")
                .published(course.getPublished())
                .enrollmentOpen(course.getEnrollmentOpen())
                .maxEnrollment(course.getMaxEnrollment())
                .category(course.getCategory())
                .department(course.getDepartment())
                .semester(course.getSemester())
                .credits(course.getCredits())
                .difficultyLevel(course.getDifficultyLevel())
                .estimatedHours(course.getEstimatedHours())
                .prerequisites(course.getPrerequisites())
                .learningObjectives(course.getLearningObjectives())
                .tags(course.getTags())
                .createdAt(course.getCreatedAt() != null ? course.getCreatedAt().toString() : null)
                .updatedAt(course.getUpdatedAt() != null ? course.getUpdatedAt().toString() : null)
                .topics(topicResponses)
                .enrollmentCount(enrollmentRepository.countByCourseId(courseId))
                .isEnrolled(isEnrolled)
                .progressPercentage(progress)
                .build();
    }

    // --- Publish / Unpublish ---

    public CourseDtos.CourseResponse publishCourse(String requesterEmail, Long courseId) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, course);
        course.setPublished(true);
        course.setStatus(CourseStatus.PUBLISHED);
        course = courseRepository.save(course);
        return toResponse(course);
    }

    public CourseDtos.CourseResponse unpublishCourse(String requesterEmail, Long courseId) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, course);
        course.setPublished(false);
        course.setStatus(CourseStatus.DRAFT);
        course = courseRepository.save(course);
        return toResponse(course);
    }

    // --- Toggle Enrollment Open/Close ---

    public CourseDtos.CourseResponse toggleEnrollment(String requesterEmail, Long courseId, boolean open) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, course);
        course.setEnrollmentOpen(open);
        course = courseRepository.save(course);
        return toResponse(course);
    }

    // --- College-scoped courses ---

    public List<CourseDtos.CourseResponse> getCoursesByCollege(String requesterEmail, Long collegeId) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only SuperAdmin/RootAdmin can query by college");
        }
        return courseRepository.findByCollegeId(collegeId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // --- Search / Filter ---

    public List<CourseDtos.CourseResponse> searchCourses(String requesterEmail, String keyword, String category, String difficultyLevel) {
        User requester = requireUser(requesterEmail);
        List<Course> courses;

        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            courses = courseRepository.findAll();
        } else if (requester.getCollege() != null) {
            courses = courseRepository.findByCollegeId(requester.getCollege().getId());
        } else {
            courses = new ArrayList<>();
        }

        // Apply filters
        return courses.stream()
                .filter(c -> keyword == null || keyword.isBlank()
                        || c.getTitle().toLowerCase().contains(keyword.toLowerCase())
                        || (c.getDescription() != null && c.getDescription().toLowerCase().contains(keyword.toLowerCase()))
                        || (c.getTags() != null && c.getTags().toLowerCase().contains(keyword.toLowerCase())))
                .filter(c -> category == null || category.isBlank()
                        || (c.getCategory() != null && c.getCategory().equalsIgnoreCase(category)))
                .filter(c -> difficultyLevel == null || difficultyLevel.isBlank()
                        || (c.getDifficultyLevel() != null && c.getDifficultyLevel().equalsIgnoreCase(difficultyLevel)))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // --- Course Statistics ---

    public CourseDtos.CourseStatsResponse getCourseStats(String requesterEmail, Long courseId) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, course);

        long totalEnrollments = enrollmentRepository.countByCourseId(courseId);
        long activeEnrollments = enrollmentRepository.countByCourseIdAndStatus(courseId, EnrollmentStatus.ACTIVE);
        long completedEnrollments = enrollmentRepository.countByCourseIdAndStatus(courseId, EnrollmentStatus.COMPLETED);
        long droppedEnrollments = enrollmentRepository.countByCourseIdAndStatus(courseId, EnrollmentStatus.DROPPED);

        int totalTopics = course.getTopics() != null ? course.getTopics().size() : 0;
        int totalChapters = 0;
        if (course.getTopics() != null) {
            for (Topic topic : course.getTopics()) {
                totalChapters += chapterRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId()).size();
            }
        }
        int totalTests = course.getTests() != null ? course.getTests().size() : 0;

        double completionRate = totalEnrollments > 0 ? (double) completedEnrollments / totalEnrollments * 100 : 0;

        return CourseDtos.CourseStatsResponse.builder()
                .courseId(courseId)
                .courseTitle(course.getTitle())
                .totalEnrollments(totalEnrollments)
                .activeEnrollments(activeEnrollments)
                .completedEnrollments(completedEnrollments)
                .droppedEnrollments(droppedEnrollments)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .totalTopics(totalTopics)
                .totalChapters(totalChapters)
                .totalTests(totalTests)
                .published(course.getPublished())
                .enrollmentOpen(course.getEnrollmentOpen())
                .status(course.getStatus() != null ? course.getStatus().name() : "DRAFT")
                .build();
    }

    // --- Dashboard Statistics ---

    public CourseDtos.DashboardStatsResponse getDashboardStats(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        List<Course> courses;

        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            courses = courseRepository.findAll();
        } else if (requester.getType() == UserType.ADMIN && requester.getCollege() != null) {
            courses = courseRepository.findByCollegeId(requester.getCollege().getId());
        } else if (requester.getType() == UserType.FACULTY) {
            courses = courseRepository.findByCreatedById(requester.getId());
        } else {
            courses = new ArrayList<>();
        }

        long totalCourses = courses.size();
        long publishedCourses = courses.stream().filter(c -> c.getStatus() == CourseStatus.PUBLISHED || Boolean.TRUE.equals(c.getPublished())).count();
        long archivedCourses = courses.stream().filter(c -> c.getStatus() == CourseStatus.ARCHIVED).count();
        long draftCourses = totalCourses - publishedCourses - archivedCourses;

        long totalEnrollments = 0;
        long activeEnrollments = 0;
        long completedEnrollments = 0;
        int totalTopics = 0;
        int totalChapters = 0;

        for (Course course : courses) {
            totalEnrollments += enrollmentRepository.countByCourseId(course.getId());
            activeEnrollments += enrollmentRepository.countByCourseIdAndStatus(course.getId(), EnrollmentStatus.ACTIVE);
            completedEnrollments += enrollmentRepository.countByCourseIdAndStatus(course.getId(), EnrollmentStatus.COMPLETED);
            totalTopics += course.getTopics() != null ? course.getTopics().size() : 0;
            if (course.getTopics() != null) {
                for (Topic topic : course.getTopics()) {
                    totalChapters += chapterRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId()).size();
                }
            }
        }

        // Category distribution
        Map<String, Long> categoryDistribution = courses.stream()
                .filter(c -> c.getCategory() != null && !c.getCategory().isBlank())
                .collect(Collectors.groupingBy(Course::getCategory, Collectors.counting()));

        // Difficulty distribution
        Map<String, Long> difficultyDistribution = courses.stream()
                .filter(c -> c.getDifficultyLevel() != null && !c.getDifficultyLevel().isBlank())
                .collect(Collectors.groupingBy(Course::getDifficultyLevel, Collectors.counting()));

        // Status distribution
        Map<String, Long> statusDistribution = courses.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getStatus() != null ? c.getStatus().name() : "DRAFT",
                        Collectors.counting()));

        return CourseDtos.DashboardStatsResponse.builder()
                .totalCourses(totalCourses)
                .publishedCourses(publishedCourses)
                .draftCourses(draftCourses)
                .archivedCourses(archivedCourses)
                .totalEnrollments(totalEnrollments)
                .activeEnrollments(activeEnrollments)
                .completedEnrollments(completedEnrollments)
                .totalTopics(totalTopics)
                .totalChapters(totalChapters)
                .categoryDistribution(categoryDistribution)
                .difficultyDistribution(difficultyDistribution)
                .statusDistribution(statusDistribution)
                .build();
    }

    // --- Clone/Duplicate Course ---

    public CourseDtos.CourseResponse cloneCourse(String requesterEmail, Long courseId) {
        User requester = requireUser(requesterEmail);
        Course original = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, original);

        College college = requester.getCollege() != null ? requester.getCollege() : original.getCollege();

        Course clone = Course.builder()
                .title(original.getTitle() + " (Copy)")
                .courseCode(null) // Clear code so it's unique
                .description(original.getDescription())
                .thumbnailUrl(original.getThumbnailUrl())
                .createdBy(requester)
                .college(college)
                .status(CourseStatus.DRAFT)
                .published(false)
                .enrollmentOpen(false)
                .maxEnrollment(original.getMaxEnrollment())
                .displayOrder(original.getDisplayOrder())
                .category(original.getCategory())
                .department(original.getDepartment())
                .semester(original.getSemester())
                .credits(original.getCredits())
                .difficultyLevel(original.getDifficultyLevel())
                .estimatedHours(original.getEstimatedHours())
                .prerequisites(original.getPrerequisites())
                .learningObjectives(original.getLearningObjectives())
                .tags(original.getTags())
                .topics(original.getTopics() != null ? new ArrayList<>(original.getTopics()) : new ArrayList<>())
                .tests(original.getTests() != null ? new ArrayList<>(original.getTests()) : new ArrayList<>())
                .build();

        clone = courseRepository.save(clone);
        return toResponse(clone);
    }

    // --- Manage Course Curriculum (Add/Remove Topics) ---
    // DEPRECATED: Topics now belong directly to courses via course_id foreign key
    // These methods are no longer needed - topics are created with courseId
    
    /*
    public CourseDtos.CourseResponse addTopicToCourse(String requesterEmail, Long courseId, Long topicId) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, course);

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        if (course.getTopics() == null) course.setTopics(new ArrayList<>());
        if (course.getTopics().stream().anyMatch(t -> t.getId().equals(topicId))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic already in course");
        }
        course.getTopics().add(topic);
        course = courseRepository.save(course);
        return toResponse(course);
    }

    public CourseDtos.CourseResponse removeTopicFromCourse(String requesterEmail, Long courseId, Long topicId) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, course);

        if (course.getTopics() != null) {
            course.getTopics().removeIf(t -> t.getId().equals(topicId));
        }
        course = courseRepository.save(course);
        return toResponse(course);
    }

    public CourseDtos.CourseResponse reorderTopics(String requesterEmail, Long courseId, List<Long> topicIds) {
        User requester = requireUser(requesterEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        verifyAccess(requester, course);

        List<Topic> orderedTopics = new ArrayList<>();
        for (Long topicId : topicIds) {
            Topic topic = topicRepository.findById(topicId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic " + topicId + " not found"));
            orderedTopics.add(topic);
        }
        course.setTopics(orderedTopics);
        course = courseRepository.save(course);
        return toResponse(course);
    }
    */

    private boolean isContentManager(User user, Course course) {
        if (user.getType() == UserType.SUPERADMIN || user.getType() == UserType.ROOTADMIN) return true;
        if (user.getType() == UserType.ADMIN &&
            user.getCollege() != null && user.getCollege().getId().equals(course.getCollege().getId())) return true;
        if (user.getType() == UserType.FACULTY &&
            course.getCreatedBy().getId().equals(user.getId())) return true;
        return false;
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
                .courseCode(course.getCourseCode())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .createdById(course.getCreatedBy().getId())
                .createdByName(course.getCreatedBy().getName())
                .collegeId(course.getCollege().getId())
                .collegeName(course.getCollege().getName())
                .status(course.getStatus() != null ? course.getStatus().name() : "DRAFT")
                .published(course.getPublished())
                .enrollmentOpen(course.getEnrollmentOpen())
                .maxEnrollment(course.getMaxEnrollment())
                .displayOrder(course.getDisplayOrder())
                .category(course.getCategory())
                .department(course.getDepartment())
                .semester(course.getSemester())
                .credits(course.getCredits())
                .difficultyLevel(course.getDifficultyLevel())
                .estimatedHours(course.getEstimatedHours())
                .prerequisites(course.getPrerequisites())
                .learningObjectives(course.getLearningObjectives())
                .tags(course.getTags())
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
