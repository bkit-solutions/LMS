package in.bkitsolutions.lmsbackend.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class SessionReportDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpsertReportRequest {
        private Integer headsTurned;
        private Integer headTilts;
        private Integer lookAways;
        private Integer multiplePeople;
        private Integer faceVisibilityIssues;
        private Integer mobileDetected;
        private Integer audioIncidents;
        private Integer tabSwitches;
        private Integer windowSwitches;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinalizeReportRequest {
        private Boolean isValidTest;
        private String invalidReason;
    }
}
