package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Chapter;
import in.bkitsolutions.lmsbackend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findByTopicOrderByDisplayOrderAsc(Topic topic);

    List<Chapter> findByTopicIdOrderByDisplayOrderAsc(Long topicId);
}
