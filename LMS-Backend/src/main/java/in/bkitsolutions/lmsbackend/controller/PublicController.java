package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.CollegeDtos;
import in.bkitsolutions.lmsbackend.service.CollegeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/public")
public class PublicController {
    private final CollegeService collegeService;

    public PublicController(CollegeService collegeService) {
        this.collegeService = collegeService;
    }

    @GetMapping("/college-branding/{code}")
    public ResponseEntity<ApiResponse<CollegeDtos.CollegeBrandingResponse>> getCollegeBranding(
            @PathVariable String code) {
        CollegeDtos.CollegeBrandingResponse branding = collegeService.getCollegeBranding(code);
        return ResponseEntity.ok(ApiResponse.ok("Branding retrieved", branding));
    }
}
