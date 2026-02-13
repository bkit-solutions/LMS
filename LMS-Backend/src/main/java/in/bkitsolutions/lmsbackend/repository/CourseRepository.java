package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Course;
import in.bkitsolutions.lmsbackend.model.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCollegeId(Long collegeId);
    List<Course> findByCollegeIdAndPublishedTrue(Long collegeId);
    List<Course> findByCreatedById(Long userId);
    List<Course> findByCollegeIdAndCreatedById(Long collegeId, Long userId);
    List<Course> findByCollegeIdAndStatus(Long collegeId, CourseStatus status);
    List<Course> findByStatus(CourseStatus status);
    Optional<Course> findByCourseCodeAndCollegeId(String courseCode, Long collegeId);
    boolean existsByCourseCodeAndCollegeId(String courseCode, Long collegeId);
}
