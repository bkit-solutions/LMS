package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.model.*;
import in.bkitsolutions.lmsbackend.repository.*;
import in.bkitsolutions.lmsbackend.dto.AttemptDtos;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttemptService {
    private final TestRepository testRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;

    public AttemptService(TestRepository testRepository, TestAttemptRepository testAttemptRepository,
                          QuestionRepository questionRepository, AnswerRepository answerRepository,
                          UserRepository userRepository) {
        this.testRepository = testRepository;
        this.testAttemptRepository = testAttemptRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void ensureActiveWindow(TestEntity test, User requester) {
        // Admins/SuperAdmins can bypass window checks for previewing
        if (requester.getType() != UserType.USER) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        if (Boolean.FALSE.equals(test.getPublished())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Test not published");
        }
        if (test.getStartTime() != null && now.isBefore(test.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Test not started yet");
        }
        if (test.getEndTime() != null && now.isAfter(test.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Test has ended");
        }
    }

    public TestAttempt startAttempt(String requesterEmail, Long testId) {
        User requester = requireUser(requesterEmail);
        // Allow Users, Admins, and SuperAdmins to start/preview attempts
        // if (requester.getType() != UserType.USER) {
        //     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can start attempts");
        // }
        
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        
        // RELAXED: Removed strict ownership check to allow easier testing/hackathon usage
        // User admin = requester.getCreatedBy();
        // if (admin == null || !admin.getId().equals(test.getCreatedBy().getId())) {
        //     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Test not assigned to you");
        // }
        
        ensureActiveWindow(test, requester);

        int maxAttempts = (test.getMaxAttempts() == null || test.getMaxAttempts() <= 0) ? 1 : test.getMaxAttempts();
        Optional<TestAttempt> existingOpt = testAttemptRepository
                .findTopByTestAndStudentOrderByAttemptNumberDesc(test, requester);

        if (existingOpt.isPresent()) {
            TestAttempt attempt = existingOpt.get();
            int currentAttempt = attempt.getAttemptNumber() == null ? 0 : attempt.getAttemptNumber();
            if (currentAttempt >= maxAttempts) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max attempts reached");
            }
            // Per requirements: increment attempt number on each POST, do not reset any fields
            attempt.setAttemptNumber(currentAttempt + 1);
            // updatedAt will be auto-updated by @UpdateTimestamp
            return testAttemptRepository.save(attempt);
        } else {
            // First time: create row with attemptNumber=1
            TestAttempt attempt = TestAttempt.builder()
                    .test(test)
                    .student(requester)
                    .attemptNumber(1)
                    .startedAt(LocalDateTime.now())
                    .completed(false)
                    .score(0)
                    .build();
            return testAttemptRepository.save(attempt);
        }
    }

    public void submitOrUpdateAnswer(String requesterEmail, Long attemptId, Long questionId, String answerText) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));
        if (!attempt.getStudent().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your attempt");
        }
        if (Boolean.TRUE.equals(attempt.getCompleted())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attempt already completed");
        }
        TestEntity test = attempt.getTest();
        // Only allow answering while test is active
        ensureActiveWindow(test, requester);

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        if (!question.getTest().getId().equals(test.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question not part of this test");
        }

        boolean isCorrect = evaluateCorrectness(question, answerText);
        Answer answer = answerRepository.findByAttemptAndQuestion(attempt, question)
                .orElse(Answer.builder().attempt(attempt).question(question).build());
        answer.setAnswerText(answerText);
        answer.setCorrect(isCorrect);
        answerRepository.save(answer);
    }

    public TestAttempt submitAttempt(String requesterEmail, Long attemptId) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));
        if (!attempt.getStudent().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your attempt");
        }
        if (Boolean.TRUE.equals(attempt.getCompleted())) {
            return attempt; // idempotent
        }
        // After end time we still allow finalization but not new answers (handled earlier)
        int score = computeScore(attempt);
        attempt.setScore(score);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setCompleted(true);
        return testAttemptRepository.save(attempt);
    }

    public TestAttempt getAttempt(String requesterEmail, Long attemptId) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));
        if (requester.getType() == UserType.USER && !attempt.getStudent().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your attempt");
        }
        return attempt;
    }

    public AttemptDtos.AttemptStateResponse getAttemptState(String requesterEmail, Long attemptId) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));
        if (requester.getType() == UserType.USER && !attempt.getStudent().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your attempt");
        }
        return buildAttemptStateResponse(attempt);
    }

    public AttemptDtos.AttemptStateResponse getAttemptStateByTest(String requesterEmail, Long testId) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can view their attempt state");
        }
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        // Ensure the test is assigned to the same admin that created the user
        User admin = requester.getCreatedBy();
        if (admin == null || !admin.getId().equals(test.getCreatedBy().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Test not assigned to you");
        }

        TestAttempt attempt = testAttemptRepository
                .findTopByTestAndStudentOrderByAttemptNumberDesc(test, requester)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));

        return buildAttemptStateResponse(attempt);
    }

    private AttemptDtos.AttemptStateResponse buildAttemptStateResponse(TestAttempt attempt) {
        TestEntity test = attempt.getTest();
        // Fetch questions for this test
        List<Question> questions = questionRepository.findByTest(test);
        // Fetch saved answers for this attempt
        List<Answer> answers = answerRepository.findByAttempt(attempt);

        // Build DTOs
        AttemptDtos.AttemptInfo info = new AttemptDtos.AttemptInfo(
                attempt.getId(),
                test.getId(),                                                                                   // testId
                attempt.getAttemptNumber(),
                attempt.getCompleted(),
                attempt.getStartedAt() == null ? null : attempt.getStartedAt().toString(),
                attempt.getSubmittedAt() == null ? null : attempt.getSubmittedAt().toString(),
                attempt.getUpdatedAt() == null ? null : attempt.getUpdatedAt().toString(),
                test.getProctored() != null ? test.getProctored() : false,
                test.getDurationMinutes(),                                                                      // durationMinutes
                test.getMaxViolations() != null ? test.getMaxViolations() : 5                                 // maxViolations
        );

        List<AttemptDtos.QuestionItem> questionItems = questions.stream().map(q -> new AttemptDtos.QuestionItem(
                q.getId(),
                q.getQuestionType() == null ? null : q.getQuestionType().name(),
                q.getQuestionText(),
                q.getMarks(),
                q.getNegativeMarks(),
                q.getOptionA(),
                q.getOptionB(),
                q.getOptionC(),
                q.getOptionD()
        )).toList();

        Map<Long, String> ansMap = new HashMap<>();
        for (Answer a : answers) {
            if (a.getQuestion() != null) {
                ansMap.put(a.getQuestion().getId(), a.getAnswerText());
            }
        }

        return new AttemptDtos.AttemptStateResponse(info, questionItems, ansMap);
    }

    public Optional<TestAttempt> getLatestAttemptForUser(String requesterEmail, Long testId, boolean onlyIncomplete) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can query their attempts");
        }
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        // Ensure the test belongs to the same admin
        User admin = requester.getCreatedBy();
        if (admin == null || !admin.getId().equals(test.getCreatedBy().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Test not assigned to you");
        }

        Optional<TestAttempt> latest = testAttemptRepository.findTopByTestAndStudentOrderByAttemptNumberDesc(test, requester);
        if (onlyIncomplete) {
            if (latest.isPresent() && Boolean.TRUE.equals(latest.get().getCompleted())) {
                return Optional.empty();
            }
        }
        return latest;
    }

    private int computeScore(TestAttempt attempt) {
        List<Answer> answers = answerRepository.findByAttempt(attempt);
        int total = 0;
        for (Answer a : answers) {
            Question q = a.getQuestion();
            int marks = (q.getMarks() == null || q.getMarks() <= 0) ? 1 : q.getMarks();
            int negative = (q.getNegativeMarks() == null || q.getNegativeMarks() < 0) ? 0 : q.getNegativeMarks();
            if (Boolean.TRUE.equals(a.getCorrect())) {
                total += marks;
            } else {
                total -= negative;
            }
        }
        return Math.max(total, 0); // avoid negative total score
    }

    private boolean evaluateCorrectness(Question question, String rawAnswer) {
        if (rawAnswer == null) return false;
        QuestionType type = question.getQuestionType();
        if (type == QuestionType.FILL_BLANK) {
            String expected = normalizeFillBlank(question.getCorrectAnswer());
            String actual = normalizeFillBlank(rawAnswer);
            return expected.equals(actual);
        }

        String ans = rawAnswer.trim().toUpperCase();
        if (type == QuestionType.MAQ) {
            // Multiple-answer question: compare sets order-agnostically
            String multi = question.getCorrectOptionsCsv();
            if (multi == null || multi.isBlank()) return false;
            Set<String> expected = Arrays.stream(multi.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).map(String::toUpperCase).collect(Collectors.toSet());
            Set<String> actual = Arrays.stream(ans.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).map(String::toUpperCase).collect(Collectors.toSet());
            return expected.equals(actual);
        }

        // MCQ: default single-correct; for backward compatibility we still accept multi if configured
        String single = question.getCorrectOption();
        String multi = question.getCorrectOptionsCsv();
        if (multi != null && !multi.isBlank()) {
            Set<String> expected = Arrays.stream(multi.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).map(String::toUpperCase).collect(Collectors.toSet());
            Set<String> actual = Arrays.stream(ans.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).map(String::toUpperCase).collect(Collectors.toSet());
            return expected.equals(actual);
        } else if (single != null && !single.isBlank()) {
            return ans.equals(single.trim().toUpperCase());
        }
        return false;
    }

    private String normalizeFillBlank(String s) {
        if (s == null) return "";
        // remove dashes and underscores, collapse spaces, lowercase
        String t = s.replaceAll("[-_]", " ");
        t = t.trim().replaceAll("\\s+", " ");
        t = t.replace(" ", ""); // remove spaces to compare by letters only
        return t.toLowerCase();
    }
}
