package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @Column(nullable = false)
    @Builder.Default
    private Boolean published = false;

    @Column(name = "enrollment_open")
    @Builder.Default
    private Boolean enrollmentOpen = true;

    @Column(name = "max_enrollment")
    private Integer maxEnrollment;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "category")
    private String category;

    @Column(name = "difficulty_level", length = 50)
    private String difficultyLevel;

    @Column(name = "estimated_hours")
    private Integer estimatedHours;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(
        name = "course_topics",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "topic_id")
    )
    @Builder.Default
    private List<Topic> topics = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "course_tests",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "test_id")
    )
    @Builder.Default
    private List<TestEntity> tests = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
