package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "test_id", nullable = false)
    private TestEntity test;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    private Integer marks; // default to 1 if null

    private Integer negativeMarks; // default to 0 if null

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type")
    private QuestionType questionType; // MCQ or FILL_BLANK

    // MCQ options
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    // Single-correct option (A/B/C/D)
    private String correctOption;

    // For multiple-correct MCQ, store comma-separated options like "A,B" (upper-case letters)
    private String correctOptionsCsv;

    // For fill-in-the-blank
    private String correctAnswer;

    // For essay/short answer questions
    private Integer characterLimit;

    // For image-based questions
    private String imageUrl;

    // For upload-based answers
    private Boolean allowFileUpload;
    private String fileUploadInstructions;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Answer> answers = new java.util.ArrayList<>();
}
