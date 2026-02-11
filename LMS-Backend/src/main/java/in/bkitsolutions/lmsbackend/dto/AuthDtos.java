package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDtos {
    @Data
    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;
        @NotBlank
        private String password;
        // Optional: College code for college-specific login
        private String collegeCode;
    }

    @Data
    public static class AuthResponse {
        private final String token;
    }

    @Data
    public static class CreateAdminRequest {
        @NotBlank
        private String name;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        @Size(min = 6)
        private String password;
        private Long collegeId;
    }

    @Data
    public static class CreateFacultyRequest {
        @NotBlank
        private String name;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        @Size(min = 6)
        private String password;
        private Long collegeId;
    }

    @Data
    public static class CreateUserRequest {
        @NotBlank
        private String name;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        @Size(min = 6)
        private String password;
        private Long collegeId;
    }

    @Data
    public static class InitSuperAdminRequest {
        @NotBlank
        private String name;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        @Size(min = 6)
        private String password;
    }

    // New: initialize the single ROOTADMIN
    @Data
    public static class InitRootAdminRequest {
        @NotBlank
        private String name;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        @Size(min = 6)
        private String password;
    }

    // New: ROOTADMIN can create SUPERADMINs
    @Data
    public static class CreateSuperAdminRequest {
        @NotBlank
        private String name;
        @Email
        @NotBlank
        private String email;
        @NotBlank
        @Size(min = 6)
        private String password;
    }
}
