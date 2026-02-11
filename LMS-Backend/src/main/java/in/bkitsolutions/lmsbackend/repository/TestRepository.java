package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.TestEntity;
import in.bkitsolutions.lmsbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TestRepository extends JpaRepository<TestEntity, Long> {
    List<TestEntity> findByCreatedBy(User createdBy);

    @Query("SELECT t FROM TestEntity t WHERE t.published = true OR t.startTime <= :now AND t.endTime >= :now AND t.createdBy = :admin")
    List<TestEntity> findActivePublishedByAdmin(@Param("admin") User admin, @Param("now") LocalDateTime now);

    @Query("SELECT t FROM TestEntity t JOIN t.createdBy u WHERE u.college.id = :collegeId")
    List<TestEntity> findByCollegeId(@Param("collegeId") Long collegeId);
}
