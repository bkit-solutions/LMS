package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.CertificateDtos;
import in.bkitsolutions.lmsbackend.service.CertificateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {
    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<CertificateDtos.CertificateResponse>> issue(
            Authentication auth, @PathVariable Long courseId) {
        String email = (String) auth.getPrincipal();
        CertificateDtos.CertificateResponse certificate = certificateService.issueCertificate(email, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Certificate issued", certificate));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<CertificateDtos.CertificateResponse>>> myCertificates(
            Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<CertificateDtos.CertificateResponse> certificates = certificateService.getMyCertificates(email);
        return ResponseEntity.ok(ApiResponse.ok("Certificates retrieved", certificates));
    }

    @GetMapping("/verify/{uid}")
    public ResponseEntity<ApiResponse<CertificateDtos.CertificateVerifyResponse>> verify(
            @PathVariable String uid) {
        CertificateDtos.CertificateVerifyResponse result = certificateService.verifyCertificate(uid);
        return ResponseEntity.ok(ApiResponse.ok("Certificate verified", result));
    }
}
