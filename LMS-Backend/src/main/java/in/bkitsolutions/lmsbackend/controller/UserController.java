package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import in.bkitsolutions.lmsbackend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public UserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
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
        
        // Only SUPERADMIN and ADMIN can view all users
        if (requester.getType() != UserType.ROOTADMIN && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can view all users");
        }
        
        List<User> allUsers = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok("Fetched all users", allUsers));
    }
}
