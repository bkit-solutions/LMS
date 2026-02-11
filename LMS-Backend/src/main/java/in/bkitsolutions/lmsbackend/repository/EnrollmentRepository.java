package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Enrollment;
import in.bkitsolutions.lmsbackend.model.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByCourseIdAndStudentId(Long courseId, Long studentId);
    boolean existsByCourseIdAndStudentId(Long courseId, Long studentId);
    boolean existsByCourseIdAndStudentIdAndStatus(Long courseId, Long studentId, EnrollmentStatus status);
    List<Enrollment> findByStudentId(Long studentId);
    List<Enrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);
    List<Enrollment> findByCourseId(Long courseId);
    long countByCourseId(Long courseId);
    long countByCourseIdAndStatus(Long courseId, EnrollmentStatus status);

    @Query("SELECT COUNT(e) FROM Enrollment e JOIN e.course c WHERE c.college.id = :collegeId")
    long countByCollegeId(@Param("collegeId") Long collegeId);
}
