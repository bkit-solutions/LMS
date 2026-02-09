package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.SessionReport;
import in.bkitsolutions.lmsbackend.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessionReportRepository extends JpaRepository<SessionReport, Long> {
    Optional<SessionReport> findByAttempt(TestAttempt attempt);
}
