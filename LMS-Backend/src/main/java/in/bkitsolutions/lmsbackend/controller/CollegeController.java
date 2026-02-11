package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.CollegeDtos;
import in.bkitsolutions.lmsbackend.service.CollegeService;
import in.bkitsolutions.lmsbackend.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/colleges")
public class CollegeController {
    private final CollegeService collegeService;
    private final FileStorageService fileStorageService;

    public CollegeController(CollegeService collegeService, FileStorageService fileStorageService) {
        this.collegeService = collegeService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CollegeDtos.CollegeResponse>> create(
            Authentication auth,
            @Valid @RequestBody CollegeDtos.CreateCollegeRequest req) {
        String email = (String) auth.getPrincipal();
        CollegeDtos.CollegeResponse college = collegeService.createCollege(email, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("College onboarded", college));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CollegeDtos.CollegeResponse>> update(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody CollegeDtos.UpdateCollegeRequest req) {
        String email = (String) auth.getPrincipal();
        CollegeDtos.CollegeResponse college = collegeService.updateCollege(email, id, req);
        return ResponseEntity.ok(ApiResponse.ok("College updated", college));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CollegeDtos.CollegeResponse>>> getAll(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<CollegeDtos.CollegeResponse> colleges = collegeService.getAllColleges(email);
        return ResponseEntity.ok(ApiResponse.ok("Colleges retrieved", colleges));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CollegeDtos.CollegeResponse>>> getActive() {
        List<CollegeDtos.CollegeResponse> colleges = collegeService.getActiveColleges();
        return ResponseEntity.ok(ApiResponse.ok("Active colleges retrieved", colleges));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CollegeDtos.CollegeResponse>> getById(@PathVariable Long id) {
        CollegeDtos.CollegeResponse college = collegeService.getCollege(id);
        return ResponseEntity.ok(ApiResponse.ok("College retrieved", college));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        collegeService.toggleCollegeStatus(email, id);
        return ResponseEntity.ok(ApiResponse.ok("College status toggled", null));
    }

    @PostMapping(value = "/upload-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadLogo(
            Authentication auth,
            @RequestParam("file") MultipartFile file) throws IOException {
        String email = (String) auth.getPrincipal();
        String logoUrl = fileStorageService.store(file, "college-logos");
        return ResponseEntity.ok(ApiResponse.ok("Logo uploaded", logoUrl));
    }

    @PostMapping(value = "/upload-banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadBanner(
            Authentication auth,
            @RequestParam("file") MultipartFile file) throws IOException {
        String email = (String) auth.getPrincipal();
        String bannerUrl = fileStorageService.store(file, "college-banners");
        return ResponseEntity.ok(ApiResponse.ok("Banner uploaded", bannerUrl));
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<ApiResponse<CollegeDtos.CollegeStatistics>> getStatistics(
            Authentication auth,
            @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        CollegeDtos.CollegeStatistics stats = collegeService.getCollegeStatistics(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Statistics retrieved", stats));
    }
}
