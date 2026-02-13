package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.CollegeDtos;
import in.bkitsolutions.lmsbackend.model.College;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.CollegeRepository;
import in.bkitsolutions.lmsbackend.repository.CourseRepository;
import in.bkitsolutions.lmsbackend.repository.TestRepository;
import in.bkitsolutions.lmsbackend.repository.EnrollmentRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CollegeService {
    private final CollegeRepository collegeRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final TestRepository testRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FileStorageService fileStorageService;

    public CollegeService(CollegeRepository collegeRepository, UserRepository userRepository,
                          CourseRepository courseRepository, TestRepository testRepository,
                          EnrollmentRepository enrollmentRepository, FileStorageService fileStorageService) {
        this.collegeRepository = collegeRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.testRepository = testRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.fileStorageService = fileStorageService;
    }

    public CollegeDtos.CollegeResponse createCollege(String requesterEmail, CollegeDtos.CreateCollegeRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Super Admin can onboard colleges");
        }
        if (collegeRepository.existsByCode(req.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "College code already exists");
        }

        College college = College.builder()
                .name(req.getName())
                .code(req.getCode().toUpperCase())
                .description(req.getDescription())
                .logoUrl(req.getLogoUrl())
                .bannerUrl(req.getBannerUrl())
                .primaryColor(req.getPrimaryColor())
                .secondaryColor(req.getSecondaryColor())
                .domain(req.getDomain())
                .address(req.getAddress())
                .contactEmail(req.getContactEmail())
                .contactPhone(req.getContactPhone())
                .onboardedBy(requester)
                .build();

        college = collegeRepository.save(college);
        return toResponse(college);
    }

    public CollegeDtos.CollegeResponse updateCollege(String requesterEmail, Long collegeId,
                                                      CollegeDtos.UpdateCollegeRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
        }

        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found"));

        // Admin can only update their own college
        if (requester.getType() == UserType.ADMIN && 
            (requester.getCollege() == null || !requester.getCollege().getId().equals(collegeId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this college");
        }

        if (req.getName() != null) college.setName(req.getName());
        if (req.getCode() != null) {
            if (!college.getCode().equals(req.getCode().toUpperCase()) && 
                collegeRepository.existsByCode(req.getCode().toUpperCase())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "College code already exists");
            }
            college.setCode(req.getCode().toUpperCase());
        }
        if (req.getDescription() != null) college.setDescription(req.getDescription());
        
        // Delete old logo if updating with new one
        if (req.getLogoUrl() != null && !req.getLogoUrl().equals(college.getLogoUrl())) {
            if (college.getLogoUrl() != null) {
                fileStorageService.delete(college.getLogoUrl());
            }
            college.setLogoUrl(req.getLogoUrl());
        }
        
        // Delete old banner if updating with new one
        if (req.getBannerUrl() != null && !req.getBannerUrl().equals(college.getBannerUrl())) {
            if (college.getBannerUrl() != null) {
                fileStorageService.delete(college.getBannerUrl());
            }
            college.setBannerUrl(req.getBannerUrl());
        }
        if (req.getPrimaryColor() != null) college.setPrimaryColor(req.getPrimaryColor());
        if (req.getSecondaryColor() != null) college.setSecondaryColor(req.getSecondaryColor());
        if (req.getDomain() != null) college.setDomain(req.getDomain());
        if (req.getAddress() != null) college.setAddress(req.getAddress());
        if (req.getContactEmail() != null) college.setContactEmail(req.getContactEmail());
        if (req.getContactPhone() != null) college.setContactPhone(req.getContactPhone());
        if (req.getIsActive() != null) college.setIsActive(req.getIsActive());

        college = collegeRepository.save(college);
        return toResponse(college);
    }

    public List<CollegeDtos.CollegeResponse> getAllColleges(String requesterEmail) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.SUPERADMIN && requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
        }
        return collegeRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<CollegeDtos.CollegeResponse> getActiveColleges() {
        return collegeRepository.findByIsActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CollegeDtos.CollegeResponse getCollege(Long collegeId) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found"));
        return toResponse(college);
    }

    public CollegeDtos.CollegeBrandingResponse getCollegeBranding(String code) {
        College college = collegeRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found"));
        return CollegeDtos.CollegeBrandingResponse.builder()
                .id(college.getId())
                .name(college.getName())
                .code(college.getCode())
                .logoUrl(college.getLogoUrl())
                .bannerUrl(college.getBannerUrl())
                .primaryColor(college.getPrimaryColor())
                .secondaryColor(college.getSecondaryColor())
                .build();
    }

    public void toggleCollegeStatus(String requesterEmail, Long collegeId) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Super Admin can toggle college status");
        }
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found"));
        college.setIsActive(!college.getIsActive());
        collegeRepository.save(college);
    }

    private CollegeDtos.CollegeResponse toResponse(College college) {
        long totalUsers = userRepository.countByCollegeId(college.getId());
        long totalCourses = courseRepository.findByCollegeId(college.getId()).size();

        return CollegeDtos.CollegeResponse.builder()
                .id(college.getId())
                .name(college.getName())
                .code(college.getCode())
                .description(college.getDescription())
                .logoUrl(college.getLogoUrl())
                .bannerUrl(college.getBannerUrl())
                .primaryColor(college.getPrimaryColor())
                .secondaryColor(college.getSecondaryColor())
                .domain(college.getDomain())
                .address(college.getAddress())
                .contactEmail(college.getContactEmail())
                .contactPhone(college.getContactPhone())
                .isActive(college.getIsActive())
                .onboardedAt(college.getOnboardedAt() != null ? college.getOnboardedAt().toString() : null)
                .onboardedById(college.getOnboardedBy().getId())
                .onboardedByName(college.getOnboardedBy().getName())
                .totalUsers(totalUsers)
                .totalCourses(totalCourses)
                .build();
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public CollegeDtos.CollegeStatistics getCollegeStatistics(String requesterEmail, Long collegeId) {
        User requester = requireUser(requesterEmail);

        // Check permissions
        if (requester.getType() != UserType.SUPERADMIN && 
            requester.getType() != UserType.ROOTADMIN &&
            requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
        }

        // Admin can only view their own college stats
        if (requester.getType() == UserType.ADMIN && 
            (requester.getCollege() == null || !requester.getCollege().getId().equals(collegeId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this college");
        }

        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found"));

        List<User> allUsers = userRepository.findByCollegeId(collegeId);
        long totalAdmins = allUsers.stream().filter(u -> u.getType() == UserType.ADMIN).count();
        long totalFaculty = allUsers.stream().filter(u -> u.getType() == UserType.FACULTY).count();
        long totalStudents = allUsers.stream().filter(u -> u.getType() == UserType.USER).count();
        long activeUsers = allUsers.stream().filter(User::getIsActive).count();
        long inactiveUsers = allUsers.size() - activeUsers;

        long totalCourses = courseRepository.findByCollegeId(collegeId).size();
        long totalTests = testRepository.findByCollegeId(collegeId).size();
        long totalEnrollments = enrollmentRepository.countByCollegeId(collegeId);

        return CollegeDtos.CollegeStatistics.builder()
                .collegeId(college.getId())
                .collegeName(college.getName())
                .collegeCode(college.getCode())
                .totalUsers((long) allUsers.size())
                .totalAdmins(totalAdmins)
                .totalFaculty(totalFaculty)
                .totalStudents(totalStudents)
                .totalCourses(totalCourses)
                .totalTests(totalTests)
                .totalEnrollments(totalEnrollments)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .createdAt(college.getOnboardedAt() != null ? college.getOnboardedAt().toString() : null)
                .lastUpdated(LocalDateTime.now().toString())
                .build();
    }
}
