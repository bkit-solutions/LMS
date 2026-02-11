package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.UserDtos;
import in.bkitsolutions.lmsbackend.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-management")
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    @PostMapping("/super-admin")
    public ResponseEntity<ApiResponse<UserDtos.UserResponse>> createSuperAdmin(
            Authentication auth,
            @Valid @RequestBody UserDtos.CreateSuperAdminRequest request) {
        String email = (String) auth.getPrincipal();
        UserDtos.UserResponse user = userManagementService.createSuperAdmin(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.ok("Super Admin created successfully", user));
    }

    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<UserDtos.UserResponse>> createAdmin(
            Authentication auth,
            @Valid @RequestBody UserDtos.CreateUserRequest request) {
        String email = (String) auth.getPrincipal();
        UserDtos.UserResponse user = userManagementService.createAdmin(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.ok("Admin created successfully", user));
    }

    @PostMapping("/faculty")
    public ResponseEntity<ApiResponse<UserDtos.UserResponse>> createFaculty(
            Authentication auth,
            @Valid @RequestBody UserDtos.CreateUserRequest request) {
        String email = (String) auth.getPrincipal();
        UserDtos.UserResponse user = userManagementService.createFaculty(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.ok("Faculty created successfully", user));
    }

    @PostMapping("/student")
    public ResponseEntity<ApiResponse<UserDtos.UserResponse>> createStudent(
            Authentication auth,
            @Valid @RequestBody UserDtos.CreateUserRequest request) {
        String email = (String) auth.getPrincipal();
        UserDtos.UserResponse user = userManagementService.createStudent(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.ok("Student created successfully", user));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDtos.UserResponse>> updateUser(
            Authentication auth,
            @PathVariable Long userId,
            @Valid @RequestBody UserDtos.UpdateUserRequest request) {
        String email = (String) auth.getPrincipal();
        UserDtos.UserResponse user = userManagementService.updateUser(email, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", user));
    }

    @PatchMapping("/{userId}/toggle-status") 
    public ResponseEntity<ApiResponse<UserDtos.UserResponse>> toggleUserStatus(
            Authentication auth,
            @PathVariable Long userId) {
        String email = (String) auth.getPrincipal();
        UserDtos.UserResponse user = userManagementService.toggleUserStatus(email, userId);
        return ResponseEntity.ok(ApiResponse.ok("User status updated", user));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            Authentication auth,
            @PathVariable Long userId) {
        String email = (String) auth.getPrincipal();
        userManagementService.deleteUser(email, userId);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully", null));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication auth,
            @Valid @RequestBody UserDtos.ChangePasswordRequest request) {
        String email = (String) auth.getPrincipal();
        userManagementService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    @GetMapping("/manageable-users")
    public ResponseEntity<ApiResponse<List<UserDtos.UserResponse>>> getManageableUsers(
            Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<UserDtos.UserResponse> users = userManagementService.getManageableUsers(email);
        return ResponseEntity.ok(ApiResponse.ok("Fetched manageable users", users));
    }

    @GetMapping("/college/{collegeId}/users")
    public ResponseEntity<ApiResponse<List<UserDtos.UserResponse>>> getCollegeUsers(
            Authentication auth,
            @PathVariable Long collegeId) {
        String email = (String) auth.getPrincipal();
        List<UserDtos.UserResponse> users = userManagementService.getCollegeUsers(email, collegeId);
        return ResponseEntity.ok(ApiResponse.ok("Fetched college users", users));
    }
}