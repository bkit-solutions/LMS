package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateUid(String certificateUid);
    Optional<Certificate> findByCourseIdAndStudentId(Long courseId, Long studentId);
    boolean existsByCourseIdAndStudentId(Long courseId, Long studentId);
    List<Certificate> findByStudentId(Long studentId);
    List<Certificate> findByCollegeId(Long collegeId);
    List<Certificate> findByCourseId(Long courseId);
}
