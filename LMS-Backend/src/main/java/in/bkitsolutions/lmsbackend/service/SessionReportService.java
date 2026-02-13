package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.model.SessionReport;
import in.bkitsolutions.lmsbackend.model.TestAttempt;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.SessionReportRepository;
import in.bkitsolutions.lmsbackend.repository.TestAttemptRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@Transactional
public class SessionReportService {
    private final SessionReportRepository sessionReportRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final UserRepository userRepository;

    public SessionReportService(SessionReportRepository sessionReportRepository,
                                TestAttemptRepository testAttemptRepository,
                                UserRepository userRepository) {
        this.sessionReportRepository = sessionReportRepository;
        this.testAttemptRepository = testAttemptRepository;
        this.userRepository = userRepository;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private TestAttempt requireOwnedAttempt(User requester, Long attemptId) {
        TestAttempt attempt = testAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));
        if (requester.getType() == UserType.USER) {
            if (!attempt.getStudent().getId().equals(requester.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your attempt");
            }
        } else if (requester.getType() == UserType.ADMIN) {
            if (!attempt.getTest().getCreatedBy().getId().equals(requester.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your student's attempt");
            }
        }
        return attempt;
    }

    public SessionReport upsertReport(String requesterEmail, Long attemptId, SessionReport partial) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = requireOwnedAttempt(requester, attemptId);
        SessionReport report = sessionReportRepository.findByAttempt(attempt)
                .orElse(SessionReport.builder().attempt(attempt).createdAt(LocalDateTime.now()).build());

        if (partial.getHeadsTurned() != null) report.setHeadsTurned(partial.getHeadsTurned());
        if (partial.getHeadTilts() != null) report.setHeadTilts(partial.getHeadTilts());
        if (partial.getLookAways() != null) report.setLookAways(partial.getLookAways());
        if (partial.getMultiplePeople() != null) report.setMultiplePeople(partial.getMultiplePeople());
        if (partial.getFaceVisibilityIssues() != null) report.setFaceVisibilityIssues(partial.getFaceVisibilityIssues());
        if (partial.getMobileDetected() != null) report.setMobileDetected(partial.getMobileDetected());
        if (partial.getAudioIncidents() != null) report.setAudioIncidents(partial.getAudioIncidents());
        if (partial.getTabSwitches() != null) report.setTabSwitches(partial.getTabSwitches());
        if (partial.getWindowSwitches() != null) report.setWindowSwitches(partial.getWindowSwitches());
        report.setUpdatedAt(LocalDateTime.now());
        return sessionReportRepository.save(report);
    }

    public SessionReport finalizeReport(String requesterEmail, Long attemptId, Boolean isValidTest, String invalidReason) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = requireOwnedAttempt(requester, attemptId);
        SessionReport report = sessionReportRepository.findByAttempt(attempt)
                .orElse(SessionReport.builder().attempt(attempt).createdAt(LocalDateTime.now()).build());
        report.setIsValidTest(isValidTest);
        report.setInvalidReason(invalidReason);
        report.setUpdatedAt(LocalDateTime.now());
        return sessionReportRepository.save(report);
    }

    public SessionReport getReport(String requesterEmail, Long attemptId) {
        User requester = requireUser(requesterEmail);
        TestAttempt attempt = requireOwnedAttempt(requester, attemptId);
        return sessionReportRepository.findByAttempt(attempt)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session report not found"));
    }
}
