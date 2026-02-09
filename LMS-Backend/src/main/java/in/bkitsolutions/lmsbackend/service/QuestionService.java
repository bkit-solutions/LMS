package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.model.*;
import in.bkitsolutions.lmsbackend.repository.QuestionRepository;
import in.bkitsolutions.lmsbackend.repository.TestRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final TestRepository testRepository;
    private final UserRepository userRepository;

    public QuestionService(QuestionRepository questionRepository, TestRepository testRepository, UserRepository userRepository) {
        this.questionRepository = questionRepository;
        this.testRepository = testRepository;
        this.userRepository = userRepository;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private TestEntity requireOwnedTest(User requester, Long testId) {
        TestEntity t = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        if (!t.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        return t;
    }

    public Question addQuestion(String requesterEmail, Long testId, Question q) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin/superadmin can add questions");
        }
        TestEntity t = requireOwnedTest(requester, testId);
        validateQuestion(q);
        q.setTest(t);
        // defaults
        if (q.getMarks() == null || q.getMarks() <= 0) q.setMarks(1);
        if (q.getNegativeMarks() == null || q.getNegativeMarks() < 0) q.setNegativeMarks(0);
        return questionRepository.save(q);
    }

    public List<Question> listQuestions(String requesterEmail, Long testId) {
        User requester = requireUser(requesterEmail);
        TestEntity t = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        
        // Check permissions
        if (requester.getType() == UserType.ADMIN || requester.getType() == UserType.SUPERADMIN) {
            // Admins can view questions for their tests
            if (!t.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to view questions for this test");
            }
        } else if (requester.getType() == UserType.USER) {
            // Students can view questions for tests they can attempt
            // Check if test is published and within time window
            if (!t.getPublished()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Test is not published");
            }
            // Additional checks can be added here (e.g., assigned to student, etc.)
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid user type");
        }
        
        return questionRepository.findByTest(t);
    }

    public Question updateQuestion(String requesterEmail, Long questionId, Question updated) {
        User requester = requireUser(requesterEmail);
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        requireOwnedTest(requester, q.getTest().getId());

        if (updated.getQuestionText() != null) q.setQuestionText(updated.getQuestionText());
        if (updated.getQuestionType() != null) q.setQuestionType(updated.getQuestionType());
        if (updated.getMarks() != null) q.setMarks(updated.getMarks());
        if (updated.getNegativeMarks() != null) q.setNegativeMarks(updated.getNegativeMarks());
        if (updated.getOptionA() != null) q.setOptionA(updated.getOptionA());
        if (updated.getOptionB() != null) q.setOptionB(updated.getOptionB());
        if (updated.getOptionC() != null) q.setOptionC(updated.getOptionC());
        if (updated.getOptionD() != null) q.setOptionD(updated.getOptionD());
        if (updated.getCorrectOption() != null) q.setCorrectOption(updated.getCorrectOption());
        if (updated.getCorrectOptionsCsv() != null) q.setCorrectOptionsCsv(updated.getCorrectOptionsCsv());
        if (updated.getCorrectAnswer() != null) q.setCorrectAnswer(updated.getCorrectAnswer());
        validateQuestion(q);
        return questionRepository.save(q);
    }

    public Long deleteQuestion(String requesterEmail, Long questionId) {
        User requester = requireUser(requesterEmail);
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        requireOwnedTest(requester, q.getTest().getId());
        Long testId = q.getTest().getId();
        questionRepository.delete(q);
        return testId;
    }

    private void validateQuestion(Question q) {
        if (q.getQuestionType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "questionType is required");
        }
        if (q.getQuestionType() == QuestionType.MCQ) {
            // Backward compatible: MCQ can be single-correct or multi-correct (legacy behavior)
            boolean hasSingle = q.getCorrectOption() != null && !q.getCorrectOption().isBlank();
            boolean hasMulti = q.getCorrectOptionsCsv() != null && !q.getCorrectOptionsCsv().isBlank();
            if (!hasSingle && !hasMulti) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide correctOption or correctOptionsCsv for MCQ");
            }
        } else if (q.getQuestionType() == QuestionType.MAQ) {
            // MAQ: must be multiple-correct using CSV
            boolean hasMulti = q.getCorrectOptionsCsv() != null && !q.getCorrectOptionsCsv().isBlank();
            if (!hasMulti) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "correctOptionsCsv is required for MAQ");
            }
            if (q.getCorrectOption() != null && !q.getCorrectOption().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Do not set correctOption for MAQ; use correctOptionsCsv");
            }
        } else if (q.getQuestionType() == QuestionType.FILL_BLANK) {
            if (q.getCorrectAnswer() == null || q.getCorrectAnswer().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "correctAnswer is required for fill-in-the-blank");
            }
        }
    }
}
