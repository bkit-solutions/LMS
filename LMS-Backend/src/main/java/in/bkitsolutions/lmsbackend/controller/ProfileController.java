package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.ProfileDtos;
import in.bkitsolutions.lmsbackend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileDtos.UserProfileResponse>> getUserProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        
        String email = (String) authentication.getPrincipal();
        ProfileDtos.UserProfileResponse profile = profileService.getUserProfile(email);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileDtos.UserProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileDtos.UpdateProfileRequest req) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        
        String email = (String) authentication.getPrincipal();
        ProfileDtos.UserProfileResponse updatedProfile = profileService.updateProfile(email, req);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updatedProfile));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ProfileDtos.ChangePasswordRequest req) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        
        String email = (String) authentication.getPrincipal();
        profileService.changePassword(email, req);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }

    @PostMapping("/upload-picture")
    public ResponseEntity<ApiResponse<ProfileDtos.UserProfileResponse>> uploadProfilePicture(
            Authentication authentication,
            @Valid @RequestBody ProfileDtos.UploadProfilePictureRequest req) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        
        String email = (String) authentication.getPrincipal();
        ProfileDtos.UserProfileResponse updatedProfile = profileService.uploadProfilePicture(email, req);
        return ResponseEntity.ok(ApiResponse.ok("Profile picture updated successfully", updatedProfile));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<ProfileDtos.UserProfileResponse>> getUserProfileById(
            Authentication authentication,
            @PathVariable Long userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Unauthorized"));
        }
        
        String email = (String) authentication.getPrincipal();
        ProfileDtos.UserProfileResponse profile = profileService.getUserProfileById(email, userId);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", profile));
    }
}
