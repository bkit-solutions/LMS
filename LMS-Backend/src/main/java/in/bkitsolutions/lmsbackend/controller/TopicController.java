package in.bkitsolutions.lmsbackend.controller;

import in.bkitsolutions.lmsbackend.dto.ApiResponse;
import in.bkitsolutions.lmsbackend.dto.TopicDtos;
import in.bkitsolutions.lmsbackend.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
