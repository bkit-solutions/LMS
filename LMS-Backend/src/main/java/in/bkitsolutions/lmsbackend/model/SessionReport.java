package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "session_reports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "attempt_id", nullable = false, unique = true)
    private TestAttempt attempt;

    private Integer headsTurned;
    private Integer headTilts;
    private Integer lookAways;
    private Integer multiplePeople;
    private Integer faceVisibilityIssues;
    private Integer mobileDetected;
    private Integer audioIncidents;
    private Integer tabSwitches;
    private Integer windowSwitches;

    private Boolean isValidTest;

    @Column(columnDefinition = "TEXT")
    private String invalidReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
