package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chapters")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content; // Rich HTML content

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    @Builder.Default
    private ContentType contentType = ContentType.TEXT;

    // For VIDEO type
    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "video_platform") // YOUTUBE, VIMEO, UPLOAD
    private String videoPlatform;

    // For DOCUMENT type
    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @Column(name = "document_name")
    private String documentName;

    @Column(name = "document_type") // PDF, DOCX, PPTX, etc.
    private String documentType;

    // For QUIZ/TEST type
    @Column(name = "test_id")
    private Long testId;

    // Estimated time to complete (in minutes)
    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    // Whether this chapter is mandatory for course completion
    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = true;

    @ManyToOne(optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
