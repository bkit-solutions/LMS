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

    @org.springframework.transaction.annotation.Transactional
    public TestAttempt startAttempt(String requesterEmail, Long testId) {
        User requester = requireUser(requesterEmail);
        // Allow Users, Admins, and SuperAdmins to start/preview attempts
        
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        
        ensureActiveWindow(test, requester);

        int maxAttempts = (test.getMaxAttempts() == null || test.getMaxAttempts() <= 0) ? 1 : test.getMaxAttempts();

        // 1. Check for any incomplete attempt first to resume (optimization)
        Optional<TestAttempt> existingIncomplete = testAttemptRepository.findByTestAndStudentAndCompletedFalse(test, requester);
        if (existingIncomplete.isPresent()) {
             System.out.println("Resuming existing incomplete attempt: " + existingIncomplete.get().getId());
             return existingIncomplete.get();
        }

        // 2. Calculate the next attempt number dynamically based on existing count
        // User wants: If I have 1 attempt (even if it's #8), next should be #2.
        long count = testAttemptRepository.countByTestAndStudent(test, requester);
        int nextAttemptNumber = (int) count + 1;

        // Safety: Ensure we don't collide with an existing attempt number (e.g. if we have #1, #3 -> count is 2 -> next is #3 -> collision!)
        while (testAttemptRepository.existsByTestAndStudentAndAttemptNumber(test, requester, nextAttemptNumber)) {
            nextAttemptNumber++;
        }

        if (nextAttemptNumber > maxAttempts) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max attempts reached");
        }

        // 3. Create a NEW attempt record for the new attempt
        TestAttempt newAttempt = TestAttempt.builder()
                .test(test)
                .student(requester)
                .attemptNumber(nextAttemptNumber)
                .startedAt(LocalDateTime.now())
                .completed(false)
                .score(0)
                .build();
        TestAttempt saved = testAttemptRepository.save(newAttempt);
        System.out.println("Started new attempt: " + saved.getId() + " (Attempt #" + nextAttemptNumber + ") for user: " + requesterEmail);
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
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
        System.out.println("Saved answer for Q:" + questionId + " Attempt:" + attemptId + " Correct:" + isCorrect);
    }

    @org.springframework.transaction.annotation.Transactional
    public TestAttempt submitAttempt(String requesterEmail, Long attemptId) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));
        if (!attempt.getStudent().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your attempt");
        }
        if (Boolean.TRUE.equals(attempt.getCompleted())) {
            System.out.println("Attempt " + attemptId + " already completed. Skipping update.");
            return attempt; // idempotent
        }
        // After end time we still allow finalization but not new answers (handled earlier)
        int score = computeScore(attempt);
        attempt.setScore(score);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setCompleted(true);
        TestAttempt saved = testAttemptRepository.save(attempt);
        System.out.println("Submitted attempt: " + attemptId + " Score: " + score);
        return saved;
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
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        // Ensure the test belongs to the same college
        if (requester.getCollege() == null || test.getCreatedBy().getCollege() == null
                || !requester.getCollege().getId().equals(test.getCreatedBy().getCollege().getId())) {
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
                test.getMaxViolations() != null ? test.getMaxViolations() : 10                                 // maxViolations
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
        TestEntity test = testRepository.findById(testId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Test not found"));
        // Ensure the test belongs to the same college
        if (requester.getCollege() == null || test.getCreatedBy().getCollege() == null
                || !requester.getCollege().getId().equals(test.getCreatedBy().getCollege().getId())) {
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
