package in.bkitsolutions.lmsbackend.dto;

import in.bkitsolutions.lmsbackend.model.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        @NotBlank(message = "Name is required")
        private String name;
        
        @Email(message = "Valid email is required")
        @NotBlank(message = "Email is required")
        private String email;
        
        @NotBlank(message = "Password is required")
        private String password;
        
        @NotNull(message = "User type is required")
        private UserType type;
        
        // Optional fields
        private String phoneNumber;
        private String bio;
        private LocalDate dateOfBirth;
        private String address;
        private String city;
        private String country;
        
        // For SUPERADMIN creating college admins
        private Long collegeId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        private String name;
        private String phoneNumber;
        private String bio;
        private LocalDate dateOfBirth;
        private String address;
        private String city;
        private String country;
        private Boolean isActive;
        private Long collegeId; // Only for role changes by super admin
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private UserType type;
        private String phoneNumber;
        private String profilePictureUrl;
        private String bio;
        private LocalDate dateOfBirth;
        private String address;
        private String city;
        private String country;
        private Boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime lastLogin;
        
        // College info
        private Long collegeId;
        private String collegeName;
        private String collegeCode;
        
        // Creator info
        private Long createdById;
        private String createdByName;
        private String createdByEmail;

        public static UserResponse fromEntity(in.bkitsolutions.lmsbackend.model.User user) {
            return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .type(user.getType())
                .phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .bio(user.getBio())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .city(user.getCity())
                .country(user.getCountry())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .collegeId(user.getCollege() != null ? user.getCollege().getId() : null)
                .collegeName(user.getCollege() != null ? user.getCollege().getName() : null)
                .collegeCode(user.getCollege() != null ? user.getCollege().getCode() : null)
                .createdById(user.getCreatedBy() != null ? user.getCreatedBy().getId() : null)
                .createdByName(user.getCreatedBy() != null ? user.getCreatedBy().getName() : null)
                .createdByEmail(user.getCreatedBy() != null ? user.getCreatedBy().getEmail() : null)
                .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;
        
        @NotBlank(message = "New password is required")  
        private String newPassword;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSuperAdminRequest {
        @NotBlank(message = "Name is required")
        private String name;
        
        @Email(message = "Valid email is required")
        @NotBlank(message = "Email is required")
        private String email;
        
        @NotBlank(message = "Password is required")
        private String password;
        
        private String phoneNumber;
        private String bio;
        private String address;
        private String city;
        private String country;
    }
}