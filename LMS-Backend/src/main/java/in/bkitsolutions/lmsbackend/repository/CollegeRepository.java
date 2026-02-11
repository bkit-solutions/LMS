package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByCode(String code);
    boolean existsByCode(String code);
    List<College> findByIsActiveTrue();
    List<College> findByOnboardedById(Long userId);
}
