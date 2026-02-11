package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalUsers;
        private long rootAdmins;
        private long superAdmins;
        private long admins;
        private long faculty;
        private long students;
        private long activeUsers;
        private long inactiveUsers;
    }

    public UserStats getGlobalUserStats() {
        return UserStats.builder()
                .totalUsers(userRepository.count())
                .rootAdmins(userRepository.findAllByType(UserType.ROOTADMIN).size())
                .superAdmins(userRepository.findAllByType(UserType.SUPERADMIN).size())
                .admins(userRepository.findAllByType(UserType.ADMIN).size())
                .faculty(userRepository.findAllByType(UserType.FACULTY).size())
                .students(userRepository.findAllByType(UserType.USER).size())
                .activeUsers(userRepository.findAll().stream().mapToLong(user -> user.getIsActive() ? 1 : 0).sum())
                .inactiveUsers(userRepository.findAll().stream().mapToLong(user -> !user.getIsActive() ? 1 : 0).sum())
                .build();
    }

    public UserStats getCollegeUserStats(Long collegeId) {
        var collegeUsers = userRepository.findByCollegeId(collegeId);
        
        return UserStats.builder()
                .totalUsers(userRepository.countByCollegeId(collegeId))
                .rootAdmins(0) // No root admins at college level
                .superAdmins(0) // No super admins at college level
                .admins(collegeUsers.stream().mapToLong(user -> user.getType() == UserType.ADMIN ? 1 : 0).sum())
                .faculty(collegeUsers.stream().mapToLong(user -> user.getType() == UserType.FACULTY ? 1 : 0).sum())
                .students(collegeUsers.stream().mapToLong(user -> user.getType() == UserType.USER ? 1 : 0).sum())
                .activeUsers(collegeUsers.stream().mapToLong(user -> user.getIsActive() ? 1 : 0).sum())
                .inactiveUsers(collegeUsers.stream().mapToLong(user -> !user.getIsActive() ? 1 : 0).sum())
                .build();
    }
}