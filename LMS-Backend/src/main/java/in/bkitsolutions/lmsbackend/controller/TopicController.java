package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.TopicDtos;
import in.bkitsolutions.lmsbackend.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/topics")
public class TopicController {
    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TopicDtos.TopicResponse>> create(Authentication auth,
            @Valid @RequestBody TopicDtos.CreateTopicRequest req) {
        String email = (String) auth.getPrincipal();
        TopicDtos.TopicResponse topic = topicService.createTopic(email, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Topic created", topic));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicDtos.TopicResponse>> update(Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody TopicDtos.UpdateTopicRequest req) {
        String email = (String) auth.getPrincipal();
        TopicDtos.TopicResponse topic = topicService.updateTopic(email, id, req);
        return ResponseEntity.ok(ApiResponse.ok("Topic updated", topic));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        topicService.deleteTopic(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Topic deleted"));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<TopicDtos.TopicResponse>>> mine(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<TopicDtos.TopicResponse> topics = topicService.getMyTopics(email);
        return ResponseEntity.ok(ApiResponse.ok("My topics", topics));
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<TopicDtos.TopicResponse>>> published(Authentication auth) {
        String email = (String) auth.getPrincipal();
        List<TopicDtos.TopicResponse> topics = topicService.getPublishedTopics(email);
        return ResponseEntity.ok(ApiResponse.ok("Published topics", topics));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TopicDtos.TopicResponse>> getById(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        TopicDtos.TopicResponse topic = topicService.getTopicById(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Topic details", topic));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<TopicDtos.TopicResponse>> publish(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        TopicDtos.TopicResponse topic = topicService.publishTopic(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Topic published", topic));
    }

    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<TopicDtos.TopicResponse>> unpublish(Authentication auth, @PathVariable Long id) {
        String email = (String) auth.getPrincipal();
        TopicDtos.TopicResponse topic = topicService.unpublishTopic(email, id);
        return ResponseEntity.ok(ApiResponse.ok("Topic unpublished", topic));
    }

    @PatchMapping("/{id}/reorder")
    public ResponseEntity<ApiResponse<TopicDtos.TopicResponse>> reorderTopic(
            Authentication auth, @PathVariable Long id, @RequestBody Map<String, Integer> body) {
        String email = (String) auth.getPrincipal();
        Integer newOrder = body.get("displayOrder");
        if (newOrder == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "displayOrder is required");
        }
        TopicDtos.TopicResponse topic = topicService.updateTopicOrder(email, id, newOrder);
        return ResponseEntity.ok(ApiResponse.ok("Topic reordered", topic));
    }

    @GetMapping("/college/{collegeId}")
    public ResponseEntity<ApiResponse<List<TopicDtos.TopicResponse>>> byCollege(
            Authentication auth, @PathVariable Long collegeId) {
        String email = (String) auth.getPrincipal();
        List<TopicDtos.TopicResponse> topics = topicService.getTopicsByCollege(email, collegeId);
        return ResponseEntity.ok(ApiResponse.ok("College topics", topics));
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<TopicDtos.TopicResponse>>> byCourse(
            Authentication auth, @PathVariable Long courseId) {
        String email = (String) auth.getPrincipal();
        List<TopicDtos.TopicResponse> topics = topicService.getTopicsByCourse(email, courseId);
        return ResponseEntity.ok(ApiResponse.ok("Course curriculum", topics));
    }
}
