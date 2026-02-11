package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import in.bkitsolutions.lmsbackend.service.AuthService;
import in.bkitsolutions.lmsbackend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(AuthService authService, UserRepository userRepository, UserService userService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> me(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        return ResponseEntity.ok(ApiResponse.ok("Fetched current user", authService.getByEmail(email)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        String email = (String) authentication.getPrincipal();
        User requester = authService.getByEmail(email);
        
        // Role-based access control based on FIXES.md requirements
        List<User> users;
        switch (requester.getType()) {
            case ROOTADMIN:
                // Root Admin: Read-only access to all users
                users = userRepository.findAll();
                break;
            case SUPERADMIN:
                // Super Admin: Read-only access to all users except ROOT ADMIN
                users = userRepository.findAll().stream()
                        .filter(user -> user.getType() != UserType.ROOTADMIN)
                        .toList();
                break;
            case ADMIN:
                // College Admin: Only users from their college
                if (requester.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin without college assignment cannot access users");
                }
                users = userRepository.findByCollegeId(requester.getCollege().getId());
                break;
            case FACULTY:
                // Faculty: Only users from their college (students and other faculty)
                if (requester.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Faculty without college assignment cannot access users");
                }
                users = userRepository.findByCollegeId(requester.getCollege().getId()).stream()
                        .filter(user -> user.getType() == UserType.USER || user.getType() == UserType.FACULTY)
                        .toList();
                break;
            case USER:
                // Students: No access to user lists
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students cannot access user lists");
            default:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Fetched users", users));
    }

    @GetMapping("/super-admins")
    public ResponseEntity<ApiResponse<List<User>>> getSuperAdmins(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User requester = authService.getByEmail(email);
        
        // Only ROOT ADMIN can manage super admins
        if (requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Root Admin can access Super Admin list");
        }
        
        List<User> superAdmins = userRepository.findAllByType(UserType.SUPERADMIN);
        return ResponseEntity.ok(ApiResponse.ok("Fetched Super Admins", superAdmins));
    }

    @GetMapping("/admins") 
    public ResponseEntity<ApiResponse<List<User>>> getAdmins(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User requester = authService.getByEmail(email);
        
        List<User> admins;
        switch (requester.getType()) {
            case ROOTADMIN:
                // Root Admin: All admins
                admins = userRepository.findAllByType(UserType.ADMIN);
                break;
            case SUPERADMIN:
                // Super Admin: All admins
                admins = userRepository.findAllByType(UserType.ADMIN);
                break;
            default:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Root Admin and Super Admin can access Admin list");
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Fetched Admins", admins));
    }

    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<User>>> getFaculty(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User requester = authService.getByEmail(email);
        
        List<User> faculty;
        switch (requester.getType()) {
            case ROOTADMIN:
            case SUPERADMIN:
                faculty = userRepository.findAllByType(UserType.FACULTY);
                break;
            case ADMIN:
                if (requester.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin without college assignment cannot access faculty");
                }
                faculty = userRepository.findByCollegeIdAndType(requester.getCollege().getId(), UserType.FACULTY);
                break;
            case FACULTY:
                if (requester.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Faculty without college assignment cannot access other faculty");
                }
                faculty = userRepository.findByCollegeIdAndType(requester.getCollege().getId(), UserType.FACULTY);
                break;
            default:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students cannot access faculty list");
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Fetched Faculty", faculty));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<User>>> getStudents(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User requester = authService.getByEmail(email);
        
        List<User> students;
        switch (requester.getType()) {
            case ROOTADMIN:
            case SUPERADMIN:
                students = userRepository.findAllByType(UserType.USER);
                break;
            case ADMIN:
            case FACULTY:
                if (requester.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User without college assignment cannot access students");
                }
                students = userRepository.findByCollegeIdAndType(requester.getCollege().getId(), UserType.USER);
                break;
            default:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students cannot access other students list");
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Fetched Students", students));
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByCollege(
            @PathVariable Long collegeId, 
            Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User requester = authService.getByEmail(email);
        
        // Only SUPERADMIN, ADMIN, and FACULTY can access college-specific users
        if (requester.getType() == UserType.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students cannot access college user lists");
        }
        
        // College admins and faculty can only access their own college
        if ((requester.getType() == UserType.ADMIN || requester.getType() == UserType.FACULTY) 
                && (requester.getCollege() == null || !requester.getCollege().getId().equals(collegeId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Can only access users from your own college");
        }
        
        List<User> users = userRepository.findByCollegeId(collegeId);
        return ResponseEntity.ok(ApiResponse.ok("Fetched college users", users));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserService.UserStats>> getUserStats(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        User requester = authService.getByEmail(email);
        
        UserService.UserStats stats;
        switch (requester.getType()) {
            case ROOTADMIN:
            case SUPERADMIN:
                stats = userService.getGlobalUserStats();
                break;
            case ADMIN:
            case FACULTY:
                if (requester.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User without college assignment cannot access stats");
                }
                stats = userService.getCollegeUserStats(requester.getCollege().getId());
                break;
            default:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students cannot access user statistics");
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Fetched user statistics", stats));
    }
}
