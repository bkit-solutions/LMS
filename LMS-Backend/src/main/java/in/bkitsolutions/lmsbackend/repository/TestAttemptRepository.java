package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.TestAttempt;
import in.bkitsolutions.lmsbackend.model.TestEntity;
import in.bkitsolutions.lmsbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByTest(TestEntity test);
    List<TestAttempt> findByStudent(User student);
    List<TestAttempt> findByTestAndStudent(TestEntity test, User student);
    Optional<TestAttempt> findTopByTestAndStudentOrderByAttemptNumberDesc(TestEntity test, User student);
}
