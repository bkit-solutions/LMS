package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.model.TestEntity;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.TestRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TestService {
    private final TestRepository testRepository;
    private final UserRepository userRepository;

    public TestService(TestRepository testRepository, UserRepository userRepository) {
        this.testRepository = testRepository;
        this.userRepository = userRepository;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public TestEntity createTest(String requesterEmail, String title, String description,
                                 LocalDateTime startTime, LocalDateTime endTime,
                                 Integer totalMarks, Boolean published, Integer maxAttempts, Boolean proctored,
                                 Integer durationMinutes, String instructions, Integer passingPercentage,
                                 String difficultyLevel, Boolean showResultsImmediately, Boolean allowReview, Integer maxViolations) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.FACULTY) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin and faculty can create tests");
        }
        if (startTime != null && endTime != null && endTime.isBefore(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
        }
        TestEntity t = TestEntity.builder()
                .title(title)
                .description(description)
                .createdBy(requester)
                .startTime(startTime)
                .endTime(endTime)
                .totalMarks(totalMarks)
                .published(Boolean.TRUE.equals(published))
                .maxAttempts((maxAttempts == null || maxAttempts <= 0) ? 1 : maxAttempts)
                .proctored(Boolean.TRUE.equals(proctored))
                // NEW FIELDS
                .durationMinutes(durationMinutes)
                .instructions(instructions)
                .passingPercentage(passingPercentage)
                .difficultyLevel(difficultyLevel)
                .showResultsImmediately(Boolean.TRUE.equals(showResultsImmediately))
                .allowReview(Boolean.TRUE.equals(allowReview))
                .maxViolations((maxViolations == null || maxViolations <= 0) ? 5 : maxViolations)
                .build();
        return testRepository.save(t);
    }

    public TestEntity updateTimesAndMeta(String requesterEmail, Long testId, String title, String description,
                                         LocalDateTime startTime, LocalDateTime endTime, Integer totalMarks, Integer maxAttempts, Boolean proctored,
                                         Integer durationMinutes, String instructions, Integer passingPercentage,
                                         String difficultyLevel, Boolean showResultsImmediately, Boolean allowReview, Integer maxViolations) {
        User requester = requireUser(requesterEmail);
        TestEntity t = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        if (!t.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        if (title != null) t.setTitle(title);
        if (description != null) t.setDescription(description);
        if (startTime != null) t.setStartTime(startTime);
        if (endTime != null) t.setEndTime(endTime);
        if (t.getEndTime() != null && t.getStartTime() != null && t.getEndTime().isBefore(t.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
        }
        if (totalMarks != null) t.setTotalMarks(totalMarks);
        if (maxAttempts != null && maxAttempts > 0) t.setMaxAttempts(maxAttempts);
        if (proctored != null) t.setProctored(proctored);
        
        // UPDATE NEW FIELDS
        if (durationMinutes != null) t.setDurationMinutes(durationMinutes);
        if (instructions != null) t.setInstructions(instructions);
        if (passingPercentage != null) t.setPassingPercentage(passingPercentage);
        if (difficultyLevel != null) t.setDifficultyLevel(difficultyLevel);
        if (showResultsImmediately != null) t.setShowResultsImmediately(showResultsImmediately);
        if (allowReview != null) t.setAllowReview(allowReview);
        if (maxViolations != null && maxViolations > 0) t.setMaxViolations(maxViolations);
        
        return testRepository.save(t);
    }

    public TestEntity publish(String requesterEmail, Long testId) {
        User requester = requireUser(requesterEmail);
        TestEntity t = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        if (!t.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        t.setPublished(true);
        return testRepository.save(t);
    }

    public List<TestEntity> myTests(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() == UserType.ADMIN || requester.getType() == UserType.FACULTY) {
            return testRepository.findByCreatedBy(requester);
        } else if (requester.getType() == UserType.SUPERADMIN) {
            return testRepository.findAll();
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin/faculty/superadmin can list tests");
    }

    public List<TestEntity> availableForStudent(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        // Allow USER and ADMIN for testing purposes
        if (requester.getType() != UserType.USER && requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users and admins can view available tests");
        }
        
        User admin;
        if (requester.getType() == UserType.ADMIN) {
            // ADMIN sees tests they created
            admin = requester;
        } else {
            // USER sees tests created by their admin
            admin = requester.getCreatedBy();
            if (admin == null) {
                // No admin linkage; nothing visible
                return List.of();
            }
        }
        
        return testRepository.findActivePublishedByAdmin(admin, LocalDateTime.now());
    }

    public TestEntity requireOwnedTest(String requesterEmail, Long testId, boolean allowSuperadmin) {
        User requester = requireUser(requesterEmail);
        TestEntity t = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        if (!t.getCreatedBy().getId().equals(requester.getId()) && (!allowSuperadmin || requester.getType() != UserType.SUPERADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        return t;
    }

    public void deleteTest(String requesterEmail, Long testId) {
        // reuse requireOwnedTest to check permission
        TestEntity t = requireOwnedTest(requesterEmail, testId, true);
        testRepository.delete(t);
    }

    public TestEntity getTestDetails(String requesterEmail, Long testId) {
        User requester = requireUser(requesterEmail);
        TestEntity t = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));

        if (requester.getType() == UserType.USER) {
            if (!Boolean.TRUE.equals(t.getPublished())) {
                 throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Test not published");
            }
        }
        return t;
    }

    public void recalculateTotalMarks(Long testId) {
        TestEntity test = testRepository.findById(testId).orElse(null);
        if (test != null) {
            int total = test.getQuestions().stream().mapToInt(q -> q.getMarks() != null ? q.getMarks() : 0).sum();
            test.setTotalMarks(total);
            testRepository.save(test);
        }
    }
}
