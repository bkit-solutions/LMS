package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer totalMarks; // optional, can be derived

    private Boolean published;

    private Integer maxAttempts;
    
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT false")
    private Boolean proctored = false; // Whether test requires proctoring
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes; // Test duration in minutes (null = unlimited)
    
    @Column(columnDefinition = "TEXT")
    private String instructions; // Detailed test instructions
    
    @Column(name = "passing_percentage")
    private Integer passingPercentage; // Minimum percentage to pass (default: null = no requirement)
    
    @Column(name = "difficulty_level")
    private String difficultyLevel; // EASY, MEDIUM, HARD
    
    @Column(name = "show_results_immediately")
    private Boolean showResultsImmediately = true; // Show results after submission
    
    @Column(name = "allow_review")
    private Boolean allowReview = false; // Allow reviewing answers after submission
    
    @Column(name = "max_violations")
    private Integer maxViolations = 10; // Maximum allowed proctoring violations (default: 10)

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Question> questions;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<TestAttempt> testAttempts;
}
