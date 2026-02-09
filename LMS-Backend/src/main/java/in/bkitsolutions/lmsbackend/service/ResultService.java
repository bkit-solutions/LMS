package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.model.TestAttempt;
import in.bkitsolutions.lmsbackend.model.TestEntity;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.TestAttemptRepository;
import in.bkitsolutions.lmsbackend.repository.TestRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
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

    public List<TestAttempt> adminAllResults(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() == UserType.SUPERADMIN) {
            return testAttemptRepository.findAll();
        }
        if (requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin/superadmin can view results");
        }
        List<TestEntity> myTests = testRepository.findByCreatedBy(requester);
        List<TestAttempt> out = new ArrayList<>();
        for (TestEntity t : myTests) {
            out.addAll(testAttemptRepository.findByTest(t));
        }
        return out;
    }

    public List<TestAttempt> adminTestResults(String requesterEmail, Long testId) {
        User requester = requireUser(requesterEmail);
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        if (requester.getType() != UserType.SUPERADMIN && !test.getCreatedBy().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        return testAttemptRepository.findByTest(test);
    }

    public List<TestAttempt> myResults(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can view their results");
        }
        return testAttemptRepository.findByStudent(requester);
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
