package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "answers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private TestAttempt attempt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "answer_text")
    private String answerText; // For MCQ: "A" or "A,B"; For FILL_BLANK: free text

    private Boolean correct;
}
