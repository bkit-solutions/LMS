package in.bkitsolutions.lmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class CertificateDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificateResponse {
        private Long id;
        private String certificateUid;
        private Long courseId;
        private String courseTitle;
        private Long studentId;
        private String studentName;
        private Long collegeId;
        private String collegeName;
        private String collegeLogoUrl;
        private String issuedAt;
        private String downloadUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificateVerifyResponse {
        private boolean valid;
        private String studentName;
        private String courseTitle;
        private String collegeName;
        private String issuedAt;
    }
}
