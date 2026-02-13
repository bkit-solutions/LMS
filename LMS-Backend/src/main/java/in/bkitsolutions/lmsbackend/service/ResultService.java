package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.AttemptDtos;
import in.bkitsolutions.lmsbackend.dto.TestDtos;
import in.bkitsolutions.lmsbackend.dto.UserDtos;
import in.bkitsolutions.lmsbackend.model.TestAttempt;
import in.bkitsolutions.lmsbackend.model.TestEntity;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.TestAttemptRepository;
import in.bkitsolutions.lmsbackend.repository.TestRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResultService {
    private final TestAttemptRepository testAttemptRepository;
    private final TestRepository testRepository;
    private final UserRepository userRepository;

    public ResultService(TestAttemptRepository testAttemptRepository, TestRepository testRepository, UserRepository userRepository) {
        this.testAttemptRepository = testAttemptRepository;
        this.testRepository = testRepository;
        this.userRepository = userRepository;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public List<AttemptDtos.ResultDto> adminAllResults(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        List<TestAttempt> attempts;
        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            attempts = testAttemptRepository.findAll();
        } else if (requester.getType() == UserType.ADMIN) {
            // Admin sees results for all tests in their college
            if (requester.getCollege() != null) {
                List<TestEntity> collegeTests = testRepository.findByCollegeId(requester.getCollege().getId());
                attempts = new ArrayList<>();
                for (TestEntity t : collegeTests) {
                    attempts.addAll(testAttemptRepository.findByTest(t));
                }
            } else {
                attempts = new ArrayList<>();
            }
        } else if (requester.getType() == UserType.FACULTY) {
            // Faculty sees results for tests they created
            List<TestEntity> myTests = testRepository.findByCreatedBy(requester);
            attempts = new ArrayList<>();
            for (TestEntity t : myTests) {
                attempts.addAll(testAttemptRepository.findByTest(t));
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin/faculty/superadmin can view results");
        }
        return attempts.stream().map(this::toResultDto).collect(Collectors.toList());
    }

    private AttemptDtos.ResultDto toResultDto(TestAttempt attempt) {
        AttemptDtos.ResultDto dto = new AttemptDtos.ResultDto();
        dto.setId(attempt.getId());
        dto.setTest(toTestResponse(attempt.getTest()));
        dto.setStudent(toUserResponse(attempt.getStudent()));
        dto.setAttemptNumber(attempt.getAttemptNumber());
        dto.setStartedAt(attempt.getStartedAt() != null ? attempt.getStartedAt().toString() : null);
        dto.setSubmittedAt(attempt.getSubmittedAt() != null ? attempt.getSubmittedAt().toString() : null);
        dto.setScore(attempt.getScore());
        dto.setCompleted(attempt.getCompleted());
        dto.setUpdatedAt(attempt.getUpdatedAt() != null ? attempt.getUpdatedAt().toString() : null);
        dto.setIsValidTest(attempt.getSessionReport() != null ? attempt.getSessionReport().getIsValidTest() : null);
        return dto;
    }

    private TestDtos.TestResponse toTestResponse(TestEntity test) {
        TestDtos.TestResponse dto = new TestDtos.TestResponse();
        dto.setId(test.getId());
        dto.setTitle(test.getTitle());
        dto.setDescription(test.getDescription());
        dto.setStartTime(test.getStartTime() != null ? test.getStartTime().toString() : null);
        dto.setEndTime(test.getEndTime() != null ? test.getEndTime().toString() : null);
        dto.setTotalMarks(test.getTotalMarks());
        dto.setPublished(test.getPublished());
        dto.setMaxAttempts(test.getMaxAttempts());
        dto.setCreatedBy(toUserResponse(test.getCreatedBy()));
        return dto;
    }

    private UserDtos.UserResponse toUserResponse(User user) {
        UserDtos.UserResponse dto = new UserDtos.UserResponse();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setType(user.getType());
        return dto;
    }

    public List<AttemptDtos.ResultDto> adminTestResults(String requesterEmail, Long testId) {
        User requester = requireUser(requesterEmail);
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        if (requester.getType() != UserType.SUPERADMIN && !test.getCreatedBy().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        List<TestAttempt> attempts = testAttemptRepository.findByTest(test);
        return attempts.stream().map(this::toResultDto).collect(Collectors.toList());
    }

    public List<AttemptDtos.ResultDto> myResults(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        // Allow USER, FACULTY, and ADMIN
        if (requester.getType() != UserType.USER && requester.getType() != UserType.FACULTY && requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users, faculty, and admins can view their results");
        }
        List<TestAttempt> attempts = testAttemptRepository.findByStudent(requester);
        return attempts.stream().map(this::toResultDto).collect(Collectors.toList());
    }

    public void deleteResult(String requesterEmail, Long resultId) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = testAttemptRepository.findById(resultId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Result not found"));
        
        // Allow delete if Superadmin OR if Admin who created the test
        boolean allowed = false;
        if (requester.getType() == UserType.SUPERADMIN) {
            allowed = true;
        } else if (requester.getType() == UserType.ADMIN) {
            if (attempt.getTest().getCreatedBy().getId().equals(requester.getId())) {
                allowed = true;
            }
        }

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this result");
        }

        testAttemptRepository.delete(attempt);
    }
}
