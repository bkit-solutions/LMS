package in.bkitsolutions.lmsbackend.model;

/**
 * Enum for different types of chapter content
 */
public enum ContentType {
    TEXT,           // Rich text/HTML content
    VIDEO,          // Video URL (YouTube, Vimeo, or uploaded)
    DOCUMENT,       // PDF, DOCX, PPT, etc.
    QUIZ,           // Link to a test/quiz
    MIXED           // Combination of multiple types
}
