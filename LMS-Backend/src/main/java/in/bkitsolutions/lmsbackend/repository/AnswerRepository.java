package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Answer;
import in.bkitsolutions.lmsbackend.model.Question;
import in.bkitsolutions.lmsbackend.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByAttempt(TestAttempt attempt);
    Optional<Answer> findByAttemptAndQuestion(TestAttempt attempt, Question question);
}
