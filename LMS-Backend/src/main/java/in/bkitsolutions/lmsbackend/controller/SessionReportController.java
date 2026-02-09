package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.SessionReportDtos;
import in.bkitsolutions.lmsbackend.model.SessionReport;
import in.bkitsolutions.lmsbackend.service.SessionReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attempts/{attemptId}/session-report")
public class SessionReportController {
    private final SessionReportService sessionReportService;

    public SessionReportController(SessionReportService sessionReportService) {
        this.sessionReportService = sessionReportService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SessionReport>> upsert(Authentication auth,
                                                             @PathVariable Long attemptId,
                                                             @Valid @RequestBody SessionReportDtos.UpsertReportRequest req) {
        String email = (String) auth.getPrincipal();
        SessionReport partial = SessionReport.builder()
                .headsTurned(req.getHeadsTurned())
                .headTilts(req.getHeadTilts())
                .lookAways(req.getLookAways())
                .multiplePeople(req.getMultiplePeople())
                .faceVisibilityIssues(req.getFaceVisibilityIssues())
                .mobileDetected(req.getMobileDetected())
                .audioIncidents(req.getAudioIncidents())
                .build();
        SessionReport saved = sessionReportService.upsertReport(email, attemptId, partial);
        return ResponseEntity.ok(ApiResponse.ok("Session report upserted", saved));
    }

    @PostMapping("/finalize")
    public ResponseEntity<ApiResponse<SessionReport>> finalizeReport(Authentication auth,
                                                                     @PathVariable Long attemptId,
                                                                     @Valid @RequestBody SessionReportDtos.FinalizeReportRequest req) {
        String email = (String) auth.getPrincipal();
        SessionReport saved = sessionReportService.finalizeReport(email, attemptId, req.getIsValidTest(), req.getInvalidReason());
        return ResponseEntity.ok(ApiResponse.ok("Session report finalized", saved));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<SessionReport>> get(Authentication auth, @PathVariable Long attemptId) {
        String email = (String) auth.getPrincipal();
        SessionReport report = sessionReportService.getReport(email, attemptId);
        return ResponseEntity.ok(ApiResponse.ok("Session report", report));
    }
}
