package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.AuthDtos;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.security.JwtUtil;
import in.bkitsolutions.lmsbackend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // One-time endpoint to create the first rootadmin (only if none exists)
    @PostMapping("/init-rootadmin")
    public ResponseEntity<ApiResponse<Void>> initRootAdmin(@Valid @RequestBody AuthDtos.InitRootAdminRequest req) {
        authService.initRootAdmin(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Rootadmin created successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDtos.AuthResponse>> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        String token = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", new AuthDtos.AuthResponse(token)));
    }

    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse<Void>> createAdmin(Authentication authentication,
                                            @Valid @RequestBody AuthDtos.CreateAdminRequest req) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        String requesterEmail = (String) authentication.getPrincipal();
        authService.createAdmin(requesterEmail, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Admin created successfully"));
    }

    @PostMapping("/create-superadmin")
    public ResponseEntity<ApiResponse<Void>> createSuperAdmin(Authentication authentication,
                                                @Valid @RequestBody AuthDtos.CreateSuperAdminRequest req) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        String requesterEmail = (String) authentication.getPrincipal();
        authService.createSuperAdmin(requesterEmail, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Superadmin created successfully"));
    }

    @GetMapping("/public/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @PostMapping("/create-user")
    public ResponseEntity<ApiResponse<Void>> createUser(Authentication authentication,
                                           @Valid @RequestBody AuthDtos.CreateUserRequest req) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        String requesterEmail = (String) authentication.getPrincipal();
        authService.createUser(requesterEmail, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User created successfully"));
    }
}
