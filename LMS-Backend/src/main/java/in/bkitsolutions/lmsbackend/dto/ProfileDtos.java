package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProfileDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfileResponse {
        private Long id;
        private String email;
        private String name;
        private String type; // USER, ADMIN, SUPERADMIN, ROOTADMIN
        private String phoneNumber;
        private String profilePictureUrl;
        private String bio;
        private LocalDate dateOfBirth;
        private String address;
        private String city;
        private String country;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;
        
        @Size(max = 20, message = "Phone number cannot exceed 20 characters")
        private String phoneNumber;
        
        @Size(max = 500, message = "Bio cannot exceed 500 characters")
        private String bio;
        
        private LocalDate dateOfBirth;
        
        @Size(max = 255, message = "Address cannot exceed 255 characters")
        private String address;
        
        @Size(max = 100, message = "City name cannot exceed 100 characters")
        private String city;
        
        @Size(max = 100, message = "Country name cannot exceed 100 characters")
        private String country;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;
        
        @NotBlank(message = "New password is required")
        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        private String newPassword;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadProfilePictureRequest {
        @NotBlank(message = "Profile picture URL is required")
        private String profilePictureUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserUpdateRequest {
        private String name;
        
        @Email(message = "Invalid email format")
        private String email;
        
        private String type; // Can only be updated by ROOTADMIN/SUPERADMIN
        private Boolean enabled; // Can only be updated by admins
    }
}
