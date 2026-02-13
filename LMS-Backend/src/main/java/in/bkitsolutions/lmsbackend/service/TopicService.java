package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.TopicDtos;
import in.bkitsolutions.lmsbackend.model.Course;
import in.bkitsolutions.lmsbackend.model.Topic;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.ChapterRepository;
import in.bkitsolutions.lmsbackend.repository.CourseRepository;
import in.bkitsolutions.lmsbackend.repository.TopicRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TopicService {
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;

    public TopicService(TopicRepository topicRepository, UserRepository userRepository, 
                        CourseRepository courseRepository, ChapterRepository chapterRepository) {
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.chapterRepository = chapterRepository;
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
        response.setCourseId(topic.getCourse() != null ? topic.getCourse().getId() : null);
        response.setCourseTitle(topic.getCourse() != null ? topic.getCourse().getTitle() : null);
        response.setCreatedById(topic.getCreatedBy().getId());
        response.setCreatedByName(topic.getCreatedBy().getName());
        response.setCollegeId(topic.getCreatedBy().getCollege() != null ? topic.getCreatedBy().getCollege().getId() : null);
        response.setCollegeName(topic.getCreatedBy().getCollege() != null ? topic.getCreatedBy().getCollege().getName() : null);
        response.setCreatedAt(topic.getCreatedAt() != null ? topic.getCreatedAt().toString() : null);
        response.setUpdatedAt(topic.getUpdatedAt() != null ? topic.getUpdatedAt().toString() : null);
        response.setChapterCount((int) chapterRepository.countByTopicId(topic.getId()));
        return response;
    }

    public TopicDtos.TopicResponse createTopic(String requesterEmail, TopicDtos.CreateTopicRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.FACULTY
                && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin, faculty, or superadmin can create topics");
        }
        
        // Validate courseId is provided
        if (req.getCourseId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "courseId is required - topics must belong to a course");
        }
        
        // Fetch and validate course
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Validate requester has access to this course
        if (requester.getType() == UserType.FACULTY || requester.getType() == UserType.ADMIN) {
            if (!course.getCreatedBy().getId().equals(requester.getId())
                    && (requester.getCollege() == null || course.getCollege() == null
                    || !requester.getCollege().getId().equals(course.getCollege().getId()))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have access to this course");
            }
        }
        
        Topic topic = Topic.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .course(course)
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
        if (!topic.getCreatedBy().getId().equals(requester.getId()) 
                && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN
                && !(requester.getType() == UserType.ADMIN && requester.getCollege() != null 
                    && topic.getCreatedBy().getCollege() != null 
                    && requester.getCollege().getId().equals(topic.getCreatedBy().getCollege().getId()))) {
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
        if (!topic.getCreatedBy().getId().equals(requester.getId()) 
                && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        topicRepository.delete(topic);
    }

    public List<TopicDtos.TopicResponse> getMyTopics(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() == UserType.ADMIN || requester.getType() == UserType.FACULTY) {
            return topicRepository.findByCreatedByOrderByDisplayOrderAsc(requester)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        } else if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            return topicRepository.findAll()
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin/faculty/superadmin can list topics");
    }

    public List<TopicDtos.TopicResponse> getTopicsByCollege(String requesterEmail, Long collegeId) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() == UserType.SUPERADMIN || requester.getType() == UserType.ROOTADMIN) {
            // Superadmins can see all topics
            return topicRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        }
        if (requester.getCollege() == null || !requester.getCollege().getId().equals(collegeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this college's topics");
        }
        // Get all topics created by users of this college
        return topicRepository.findByCreatedByCollegeIdOrderByDisplayOrderAsc(collegeId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TopicDtos.TopicResponse unpublishTopic(String requesterEmail, Long topicId) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        if (!topic.getCreatedBy().getId().equals(requester.getId()) 
                && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        topic.setPublished(false);
        Topic saved = topicRepository.save(topic);
        return toResponse(saved);
    }

    public TopicDtos.TopicResponse updateTopicOrder(String requesterEmail, Long topicId, Integer newOrder) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        
        // Verify access rights
        if (requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            if (requester.getType() == UserType.ADMIN || requester.getType() == UserType.FACULTY) {
                if (!topic.getCreatedBy().getId().equals(requester.getId())
                        && (requester.getCollege() == null || topic.getCreatedBy().getCollege() == null
                        || !requester.getCollege().getId().equals(topic.getCreatedBy().getCollege().getId()))) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to reorder this topic");
                }
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
            }
        }
        
        topic.setDisplayOrder(newOrder);
        Topic saved = topicRepository.save(topic);
        return toResponse(saved);
    }

    public List<TopicDtos.TopicResponse> getPublishedTopics(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        // Students see published topics from courses in their college
        if (requester.getType() == UserType.USER) {
            if (requester.getCollege() == null) {
                return Collections.emptyList();
            }
            return topicRepository.findByPublishedTrueOrderByDisplayOrderAsc()
                    .stream()
                    .filter(t -> t.getCourse() != null && t.getCourse().getCollege() != null && t.getCourse().getCollege().getId().equals(requester.getCollege().getId()))
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
        // Students can only see published topics from their college
        if (requester.getType() == UserType.USER) {
            if (!Boolean.TRUE.equals(topic.getPublished())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic not available");
            }
            // Check if topic belongs to a course in the student's college
            if (topic.getCourse() == null || !topic.getCourse().getCollege().getId().equals(requester.getCollege().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Topic not available");
            }
        }
        return toResponse(topic);
    }

    public TopicDtos.TopicResponse publishTopic(String requesterEmail, Long topicId) {
        User requester = requireUser(requesterEmail);
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        if (!topic.getCreatedBy().getId().equals(requester.getId()) 
                && requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        topic.setPublished(true);
        Topic saved = topicRepository.save(topic);
        return toResponse(saved);
    }
    
    public List<TopicDtos.TopicResponse> getTopicsByCourse(String requesterEmail, Long courseId) {
        User requester = requireUser(requesterEmail);
        
        // Validate course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Get topics based on user role
        if (requester.getType() == UserType.USER) {
            // Students see only published topics
            return topicRepository.findByCourseIdAndPublishedTrueOrderByDisplayOrderAsc(courseId)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        } else {
            // Faculty, Admin, SuperAdmin see all topics for the course
            return topicRepository.findByCourseIdOrderByDisplayOrderAsc(courseId)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
    }
}
