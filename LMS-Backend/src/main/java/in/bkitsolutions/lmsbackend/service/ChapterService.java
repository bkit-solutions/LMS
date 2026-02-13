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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
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
        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            return topic; // Superadmins can access all topics
        }
        if (requester.getType() == UserType.ADMIN && requester.getCollege() != null
                && topic.getCreatedBy().getCollege() != null
                && requester.getCollege().getId().equals(topic.getCreatedBy().getCollege().getId())) {
            return topic; // Admin can manage topics within their college
        }
        if (!topic.getCreatedBy().getId().equals(requester.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to manage chapters in this topic");
        }
        return topic;
    }

    private ChapterDtos.ChapterResponse toResponse(Chapter chapter) {
        ChapterDtos.ChapterResponse response = new ChapterDtos.ChapterResponse();
        response.setId(chapter.getId());
        response.setTitle(chapter.getTitle());
        response.setContent(chapter.getContent());
        response.setContentType(chapter.getContentType());
        response.setVideoUrl(chapter.getVideoUrl());
        response.setVideoPlatform(chapter.getVideoPlatform());
        response.setDocumentUrl(chapter.getDocumentUrl());
        response.setDocumentName(chapter.getDocumentName());
        response.setDocumentType(chapter.getDocumentType());
        response.setTestId(chapter.getTestId());
        response.setEstimatedMinutes(chapter.getEstimatedMinutes());
        response.setIsMandatory(chapter.getIsMandatory());
        response.setTopicId(chapter.getTopic().getId());
        response.setDisplayOrder(chapter.getDisplayOrder());
        response.setCreatedAt(chapter.getCreatedAt() != null ? chapter.getCreatedAt().toString() : null);
        response.setUpdatedAt(chapter.getUpdatedAt() != null ? chapter.getUpdatedAt().toString() : null);
        return response;
    }

    private ChapterDtos.ChapterSummary toSummary(Chapter chapter) {
        return new ChapterDtos.ChapterSummary(
            chapter.getId(), 
            chapter.getTitle(), 
            chapter.getContentType(),
            chapter.getEstimatedMinutes(),
            chapter.getIsMandatory(),
            chapter.getDisplayOrder()
        );
    }

    public ChapterDtos.ChapterResponse createChapter(String requesterEmail, Long topicId,
            ChapterDtos.CreateChapterRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.FACULTY
                && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin, faculty, or superadmin can create chapters");
        }
        Topic topic = requireOwnedTopic(requester, topicId);
        Chapter chapter = Chapter.builder()
                .title(req.getTitle())
                .content(req.getContent())
                .contentType(req.getContentType() != null ? req.getContentType() : in.bkitsolutions.lmsbackend.model.ContentType.TEXT)
                .videoUrl(req.getVideoUrl())
                .videoPlatform(req.getVideoPlatform())
                .documentUrl(req.getDocumentUrl())
                .documentName(req.getDocumentName())
                .documentType(req.getDocumentType())
                .testId(req.getTestId())
                .estimatedMinutes(req.getEstimatedMinutes())
                .isMandatory(req.getIsMandatory() != null ? req.getIsMandatory() : true)
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
        verifyTopicAccess(requester, topic);
        if (req.getTitle() != null)
            chapter.setTitle(req.getTitle());
        if (req.getContent() != null)
            chapter.setContent(req.getContent());
        if (req.getContentType() != null)
            chapter.setContentType(req.getContentType());
        if (req.getVideoUrl() != null)
            chapter.setVideoUrl(req.getVideoUrl());
        if (req.getVideoPlatform() != null)
            chapter.setVideoPlatform(req.getVideoPlatform());
        if (req.getDocumentUrl() != null)
            chapter.setDocumentUrl(req.getDocumentUrl());
        if (req.getDocumentName() != null)
            chapter.setDocumentName(req.getDocumentName());
        if (req.getDocumentType() != null)
            chapter.setDocumentType(req.getDocumentType());
        if (req.getTestId() != null)
            chapter.setTestId(req.getTestId());
        if (req.getEstimatedMinutes() != null)
            chapter.setEstimatedMinutes(req.getEstimatedMinutes());
        if (req.getIsMandatory() != null)
            chapter.setIsMandatory(req.getIsMandatory());
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
        verifyTopicAccess(requester, topic);
        chapterRepository.delete(chapter);
    }

    private void verifyTopicAccess(User requester, Topic topic) {
        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) return;
        if (requester.getType() == UserType.ADMIN && requester.getCollege() != null
                && topic.getCreatedBy().getCollege() != null
                && requester.getCollege().getId().equals(topic.getCreatedBy().getCollege().getId())) return;
        if (topic.getCreatedBy().getId().equals(requester.getId())) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
    }

    public List<ChapterDtos.ChapterSummary> getChaptersByTopic(String requesterEmail, Long topicId) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        
        // FACULTY and ADMIN can view all chapters
        if (requester.getType() == UserType.FACULTY || requester.getType() == UserType.ADMIN ||
            requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            return chapterRepository.findByTopicIdOrderByDisplayOrderAsc(topicId)
                    .stream().map(this::toSummary).collect(Collectors.toList());
        }
        
        // Students can only see chapters of published topics from their college
        if (requester.getType() == UserType.USER) {
            if (!Boolean.TRUE.equals(topic.getPublished())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic not available");
            }
            // Check if topic creator belongs to same college as student
            if (requester.getCollege() == null || topic.getCreatedBy().getCollege() == null
                    || !requester.getCollege().getId().equals(topic.getCreatedBy().getCollege().getId())) {
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
        
        // FACULTY and ADMIN can view all chapters
        if (requester.getType() == UserType.FACULTY || requester.getType() == UserType.ADMIN ||
            requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            return toResponse(chapter);
        }
        
        // Students can only see chapters of published topics from their college
        if (requester.getType() == UserType.USER) {
            if (!Boolean.TRUE.equals(topic.getPublished())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chapter not available");
            }
            // Check if topic creator belongs to same college as student
            if (requester.getCollege() == null || topic.getCreatedBy().getCollege() == null
                    || !requester.getCollege().getId().equals(topic.getCreatedBy().getCollege().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chapter not available");
            }
        }
        return toResponse(chapter);
    }

    public void updateChapterOrder(String requesterEmail, Long chapterId, Integer displayOrder) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.FACULTY
                && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chapter not found"));
        Topic topic = chapter.getTopic();
        verifyTopicAccess(requester, topic);
        chapter.setDisplayOrder(displayOrder);
        chapterRepository.save(chapter);
    }
}
