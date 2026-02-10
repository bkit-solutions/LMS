package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.ChapterDtos;
import in.bkitsolutions.lmsbackend.service.ChapterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChapterController {
    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @PostMapping("/topics/{topicId}/chapters")
    public ResponseEntity<ApiResponse<ChapterDtos.ChapterResponse>> create(Authentication auth,
            @PathVariable Long topicId,
            @Valid @RequestBody ChapterDtos.CreateChapterRequest req) {
        String email = (String) auth.getPrincipal();
        ChapterDtos.ChapterResponse chapter = chapterService.createChapter(email, topicId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Chapter created", chapter));
    }

    @GetMapping("/topics/{topicId}/chapters")
    public ResponseEntity<ApiResponse<List<ChapterDtos.ChapterSummary>>> getByTopic(Authentication auth,
            @PathVariable Long topicId) {
        String email = (String) auth.getPrincipal();
        List<ChapterDtos.ChapterSummary> chapters = chapterService.getChaptersByTopic(email, topicId);
        return ResponseEntity.ok(ApiResponse.ok("Chapters for topic", chapters));
    }

    @GetMapping("/chapters/{id}")
    public ResponseEntity<ApiResponse<ChapterDtos.ChapterResponse>> getById(Authentication auth,
            @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        ChapterDtos.ChapterResponse chapter = chapterService.getChapterById(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Chapter details", chapter));
    }

    @PatchMapping("/chapters/{id}")
    public ResponseEntity<ApiResponse<ChapterDtos.ChapterResponse>> update(Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody ChapterDtos.UpdateChapterRequest req) {
        String email = (String) auth.getPrincipal();
        ChapterDtos.ChapterResponse chapter = chapterService.updateChapter(email, id, req);
        return ResponseEntity.ok(ApiResponse.ok("Chapter updated", chapter));
    }

    @DeleteMapping("/chapters/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        chapterService.deleteChapter(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Chapter deleted"));
    }
}
