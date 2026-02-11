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

    @org.springframework.data.jpa.repository.Query("SELECT MAX(a.attemptNumber) FROM TestAttempt a WHERE a.test = :test AND a.student = :student")
    Integer findMaxAttemptNumberByTestAndStudent(TestEntity test, User student);

    Optional<TestAttempt> findByTestAndStudentAndCompletedFalse(TestEntity test, User student);
    long countByTestAndStudent(TestEntity test, User student);
    boolean existsByTestAndStudentAndAttemptNumber(TestEntity test, User student, int attemptNumber);
}
