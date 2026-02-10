package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Topic;
import in.bkitsolutions.lmsbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByCreatedBy(User createdBy);

    List<Topic> findByPublishedTrueOrderByDisplayOrderAsc();

    List<Topic> findByCreatedByOrderByDisplayOrderAsc(User createdBy);
}
