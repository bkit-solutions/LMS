package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class CollegeDtos {

    @Data
    public static class CreateCollegeRequest {
        @NotBlank
        @Size(max = 255)
        private String name;

        @NotBlank
        @Size(max = 50)
        private String code;

        private String description;
        private String logoUrl;
        private String bannerUrl;
        private String primaryColor;
        private String secondaryColor;
        private String domain;
        private String address;
        private String contactEmail;
        private String contactPhone;
    }

    @Data
    public static class UpdateCollegeRequest {
        private String name;
        private String code;
        private String description;
        private String logoUrl;
        private String bannerUrl;
        private String primaryColor;
        private String secondaryColor;
        private String domain;
        private String address;
        private String contactEmail;
        private String contactPhone;
        private Boolean isActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeResponse {
        private Long id;
        private String name;
        private String code;
        private String description;
        private String logoUrl;
        private String bannerUrl;
        private String primaryColor;
        private String secondaryColor;
        private String domain;
        private String address;
        private String contactEmail;
        private String contactPhone;
        private Boolean isActive;
        private String onboardedAt;
        private Long onboardedById;
        private String onboardedByName;
        private long totalUsers;
        private long totalCourses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeBrandingResponse {
        private Long id;
        private String name;
        private String code;
        private String logoUrl;
        private String bannerUrl;
        private String primaryColor;
        private String secondaryColor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeStatistics {
        private Long collegeId;
        private String collegeName;
        private String collegeCode;
        private Long totalUsers;
        private Long totalAdmins;
        private Long totalFaculty;
        private Long totalStudents;
        private Long totalCourses;
        private Long totalTests;
        private Long totalEnrollments;
        private Long activeUsers;
        private Long inactiveUsers;
        private String createdAt;
        private String lastUpdated;
    }
}
