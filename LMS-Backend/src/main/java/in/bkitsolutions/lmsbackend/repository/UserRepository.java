package in.bkitsolutions.lmsbackend.repository;

import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByType(UserType type);
    List<User> findAllByType(UserType type);
    List<User> findByCollegeId(Long collegeId);
    List<User> findByCollegeIdAndType(Long collegeId, UserType type);
    long countByCollegeId(Long collegeId);
}
