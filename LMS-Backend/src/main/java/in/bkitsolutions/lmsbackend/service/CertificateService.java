package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.CertificateDtos;
import in.bkitsolutions.lmsbackend.model.*;
import in.bkitsolutions.lmsbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CertificateService {
    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public CertificateService(CertificateRepository certificateRepository, CourseRepository courseRepository,
                              EnrollmentRepository enrollmentRepository, UserRepository userRepository) {
        this.certificateRepository = certificateRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    public CertificateDtos.CertificateResponse issueCertificate(String studentEmail, Long courseId) {
        User student = requireUser(studentEmail);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // Verify enrollment is completed
        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enrolled in this course"));

        if (enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course not yet completed");
        }

        // Check if certificate already issued
        if (certificateRepository.existsByCourseIdAndStudentId(courseId, student.getId())) {
            Certificate existing = certificateRepository.findByCourseIdAndStudentId(courseId, student.getId())
                    .orElseThrow();
            return toResponse(existing);
        }

        Certificate certificate = Certificate.builder()
                .certificateUid(UUID.randomUUID().toString())
                .course(course)
                .student(student)
                .college(course.getCollege())
                .studentName(student.getName())
                .courseTitle(course.getTitle())
                .collegeName(course.getCollege().getName())
                .build();

        certificate = certificateRepository.save(certificate);
        return toResponse(certificate);
    }

    public List<CertificateDtos.CertificateResponse> getMyCertificates(String studentEmail) {
        User student = requireUser(studentEmail);
        return certificateRepository.findByStudentId(student.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CertificateDtos.CertificateVerifyResponse verifyCertificate(String certificateUid) {
        Certificate certificate = certificateRepository.findByCertificateUid(certificateUid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate not found"));

        return CertificateDtos.CertificateVerifyResponse.builder()
                .valid(true)
                .studentName(certificate.getStudentName())
                .courseTitle(certificate.getCourseTitle())
                .collegeName(certificate.getCollegeName())
                .issuedAt(certificate.getIssuedAt() != null ? certificate.getIssuedAt().toString() : null)
                .build();
    }

    private CertificateDtos.CertificateResponse toResponse(Certificate certificate) {
        return CertificateDtos.CertificateResponse.builder()
                .id(certificate.getId())
                .certificateUid(certificate.getCertificateUid())
                .courseId(certificate.getCourse().getId())
                .courseTitle(certificate.getCourseTitle())
                .studentId(certificate.getStudent().getId())
                .studentName(certificate.getStudentName())
                .collegeId(certificate.getCollege().getId())
                .collegeName(certificate.getCollegeName())
                .collegeLogoUrl(certificate.getCollege().getLogoUrl())
                .issuedAt(certificate.getIssuedAt() != null ? certificate.getIssuedAt().toString() : null)
                .downloadUrl(certificate.getDownloadUrl())
                .build();
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
