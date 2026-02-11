package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "certificates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"course_id", "student_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_uid", nullable = false, unique = true, length = 100)
    private String certificateUid;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "course_title")
    private String courseTitle;

    @Column(name = "college_name")
    private String collegeName;

    @Column(name = "download_url", length = 500)
    private String downloadUrl;

    @PrePersist
    protected void onCreate() {
        issuedAt = LocalDateTime.now();
    }
}
