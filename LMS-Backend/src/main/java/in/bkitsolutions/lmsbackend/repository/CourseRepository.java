package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCollegeId(Long collegeId);
    List<Course> findByCollegeIdAndPublishedTrue(Long collegeId);
    List<Course> findByCreatedById(Long userId);
    List<Course> findByCollegeIdAndCreatedById(Long collegeId, Long userId);
}
