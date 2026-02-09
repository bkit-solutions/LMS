package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "test_attempts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_id", nullable = false)
    private TestEntity test;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private Integer score;

    private Boolean completed;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SessionReport sessionReport;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Answer> answers = new java.util.ArrayList<>();
}
