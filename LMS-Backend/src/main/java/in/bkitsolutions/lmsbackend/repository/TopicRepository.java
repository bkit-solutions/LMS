package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Topic;
import in.bkitsolutions.lmsbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByCreatedBy(User createdBy);

    List<Topic> findByPublishedTrueOrderByDisplayOrderAsc();

    List<Topic> findByCreatedByOrderByDisplayOrderAsc(User createdBy);

    List<Topic> findByCreatedByCollegeIdOrderByDisplayOrderAsc(Long collegeId);

    List<Topic> findByCreatedByCollegeIdAndPublishedTrueOrderByDisplayOrderAsc(Long collegeId);

    long countByCreatedById(Long userId);

    long countByCreatedByCollegeId(Long collegeId);
    
    // Find all topics for a specific course (ordered by display order)
    List<Topic> findByCourseIdOrderByDisplayOrderAsc(Long courseId);
    
    // Find published topics for a specific course
    List<Topic> findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(Long courseId);
}
