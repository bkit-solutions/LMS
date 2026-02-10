package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.ChapterDtos;
import in.bkitsolutions.lmsbackend.model.Chapter;
import in.bkitsolutions.lmsbackend.model.Topic;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.ChapterRepository;
import in.bkitsolutions.lmsbackend.repository.TopicRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChapterService {
    private final ChapterRepository chapterRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    public ChapterService(ChapterRepository chapterRepository, TopicRepository topicRepository,
            UserRepository userRepository) {
        this.chapterRepository = chapterRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Topic requireOwnedTopic(User requester, Long topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        if (!topic.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        return topic;
    }

    private ChapterDtos.ChapterResponse toResponse(Chapter chapter) {
        ChapterDtos.ChapterResponse response = new ChapterDtos.ChapterResponse();
        response.setId(chapter.getId());
        response.setTitle(chapter.getTitle());
        response.setContent(chapter.getContent());
        response.setTopicId(chapter.getTopic().getId());
        response.setDisplayOrder(chapter.getDisplayOrder());
        response.setCreatedAt(chapter.getCreatedAt() != null ? chapter.getCreatedAt().toString() : null);
        response.setUpdatedAt(chapter.getUpdatedAt() != null ? chapter.getUpdatedAt().toString() : null);
        return response;
    }

    private ChapterDtos.ChapterSummary toSummary(Chapter chapter) {
        return new ChapterDtos.ChapterSummary(chapter.getId(), chapter.getTitle(), chapter.getDisplayOrder());
    }

    public ChapterDtos.ChapterResponse createChapter(String requesterEmail, Long topicId,
            ChapterDtos.CreateChapterRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create chapters");
        }
        Topic topic = requireOwnedTopic(requester, topicId);
        Chapter chapter = Chapter.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .topic(topic)
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        Chapter saved = chapterRepository.save(chapter);
        return toResponse(saved);
    }

    public ChapterDtos.ChapterResponse updateChapter(String requesterEmail, Long chapterId,
            ChapterDtos.UpdateChapterRequest req) {
        User requester = requireUser(requesterEmail);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        Topic topic = chapter.getTopic();
        if (!topic.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        if (req.getTitle() != null)
            chapter.setTitle(req.getTitle());
        if (req.getContent() != null)
            chapter.setContent(req.getContent());
        if (req.getDisplayOrder() != null)
            chapter.setDisplayOrder(req.getDisplayOrder());
        Chapter saved = chapterRepository.save(chapter);
        return toResponse(saved);
    }

    public void deleteChapter(String requesterEmail, Long chapterId) {
        User requester = requireUser(requesterEmail);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        Topic topic = chapter.getTopic();
        if (!topic.getCreatedBy().getId().equals(requester.getId()) && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        chapterRepository.delete(chapter);
    }

    public List<ChapterDtos.ChapterSummary> getChaptersByTopic(String requesterEmail, Long topicId) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        // Students can only see chapters of published topics from their admin
        if (requester.getType() == UserType.USER) {
            if (!Boolean.TRUE.equals(topic.getPublished())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic not available");
            }
            User admin = requester.getCreatedBy();
            if (admin == null || !topic.getCreatedBy().getId().equals(admin.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic not available");
            }
        }
        return chapterRepository.findByTopicIdOrderByDisplayOrderAsc(topicId)
                .stream().map(this::toSummary).collect(Collectors.toList());
    }

    public ChapterDtos.ChapterResponse getChapterById(String requesterEmail, Long chapterId) {
        User requester = requireUser(requesterEmail);
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        Topic topic = chapter.getTopic();
        // Students can only see chapters of published topics from their admin
        if (requester.getType() == UserType.USER) {
            if (!Boolean.TRUE.equals(topic.getPublished())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chapter not available");
            }
            User admin = requester.getCreatedBy();
            if (admin == null || !topic.getCreatedBy().getId().equals(admin.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chapter not available");
            }
        }
        return toResponse(chapter);
    }
}
