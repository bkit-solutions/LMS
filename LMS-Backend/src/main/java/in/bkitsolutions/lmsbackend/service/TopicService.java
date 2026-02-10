package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.TopicDtos;
import in.bkitsolutions.lmsbackend.model.Topic;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.TopicRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TopicService {
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    public TopicService(TopicRepository topicRepository, UserRepository userRepository) {
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private TopicDtos.TopicResponse toResponse(Topic topic) {
        TopicDtos.TopicResponse response = new TopicDtos.TopicResponse();
        response.setId(topic.getId());
        response.setTitle(topic.getTitle());
        response.setDescription(topic.getDescription());
        response.setPublished(topic.getPublished());
        response.setDisplayOrder(topic.getDisplayOrder());
        response.setCreatedById(topic.getCreatedBy().getId());
        response.setCreatedByName(topic.getCreatedBy().getName());
        response.setCreatedAt(topic.getCreatedAt() != null ? topic.getCreatedAt().toString() : null);
        response.setUpdatedAt(topic.getUpdatedAt() != null ? topic.getUpdatedAt().toString() : null);
        response.setChapterCount(topic.getChapters() != null ? topic.getChapters().size() : 0);
        return response;
    }

    public TopicDtos.TopicResponse createTopic(String requesterEmail, TopicDtos.CreateTopicRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create topics");
        }
        Topic topic = Topic.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .createdBy(requester)
                .published(Boolean.TRUE.equals(req.getPublished()))
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        Topic saved = topicRepository.save(topic);
        return toResponse(saved);
    }

    public TopicDtos.TopicResponse updateTopic(String requesterEmail, Long topicId, TopicDtos.UpdateTopicRequest req) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        if (!topic.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        if (req.getTitle() != null)
            topic.setTitle(req.getTitle());
        if (req.getDescription() != null)
            topic.setDescription(req.getDescription());
        if (req.getPublished() != null)
            topic.setPublished(req.getPublished());
        if (req.getDisplayOrder() != null)
            topic.setDisplayOrder(req.getDisplayOrder());
        Topic saved = topicRepository.save(topic);
        return toResponse(saved);
    }

    public void deleteTopic(String requesterEmail, Long topicId) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        if (!topic.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        topicRepository.delete(topic);
    }

    public List<TopicDtos.TopicResponse> getMyTopics(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() == UserType.ADMIN) {
            return topicRepository.findByCreatedByOrderByDisplayOrderAsc(requester)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        } else if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            return topicRepository.findAll()
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin/superadmin can list their topics");
    }

    public List<TopicDtos.TopicResponse> getPublishedTopics(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        // Students see published topics from their admin
        if (requester.getType() == UserType.USER) {
            User admin = requester.getCreatedBy();
            if (admin == null) {
                return List.of();
            }
            return topicRepository.findByCreatedByOrderByDisplayOrderAsc(admin)
                    .stream()
                    .filter(t -> Boolean.TRUE.equals(t.getPublished()))
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        // Admins see their own published topics
        if (requester.getType() == UserType.ADMIN) {
            return topicRepository.findByCreatedByOrderByDisplayOrderAsc(requester)
                    .stream()
                    .filter(t -> Boolean.TRUE.equals(t.getPublished()))
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        // Superadmin/Rootadmin see all published topics
        return topicRepository.findByPublishedTrueOrderByDisplayOrderAsc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TopicDtos.TopicResponse getTopicById(String requesterEmail, Long topicId) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        // Students can only see published topics from their admin
        if (requester.getType() == UserType.USER) {
            if (!Boolean.TRUE.equals(topic.getPublished())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic not available");
            }
            User admin = requester.getCreatedBy();
            if (admin == null || !topic.getCreatedBy().getId().equals(admin.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic not available");
            }
        }
        return toResponse(topic);
    }

    public TopicDtos.TopicResponse publishTopic(String requesterEmail, Long topicId) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        if (!topic.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        topic.setPublished(true);
        Topic saved = topicRepository.save(topic);
        return toResponse(saved);
    }
}
