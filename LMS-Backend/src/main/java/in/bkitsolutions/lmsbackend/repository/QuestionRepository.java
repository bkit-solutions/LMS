package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Question;
import in.bkitsolutions.lmsbackend.model.TestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByTest(TestEntity test);
}
