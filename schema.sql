-- ============================================================================
-- BKIT LMS - Complete Database Schema
-- ============================================================================
-- Description: MySQL database schema for BKIT Learning Management System
-- Features: Multi-college support, Exam portal with AI proctoring, 
--           Course management, Role-based access control
-- Version: 1.0
-- Created: February 2026
-- Database: MySQL 8.0+
-- Charset: utf8mb4_unicode_ci
-- ============================================================================

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================================
-- 1. CORE ENTITIES
-- ============================================================================

-- Table: colleges
-- Description: Educational institutions in the multi-tenant system
CREATE TABLE colleges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    domain VARCHAR(255),
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    onboarded_at DATETIME,
    onboarded_by BIGINT NOT NULL,
    INDEX idx_colleges_code (code),
    INDEX idx_colleges_onboarded_by (onboarded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: users
-- Description: System users with hierarchical role-based access
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    type ENUM('ROOTADMIN', 'SUPERADMIN', 'ADMIN', 'FACULTY', 'USER') NOT NULL,
    college_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    date_of_birth DATE,
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    created_at DATETIME,
    last_login DATETIME,
    created_by BIGINT,
    INDEX idx_users_email (email),
    INDEX idx_users_college (college_id),
    INDEX idx_users_type (type),
    INDEX idx_users_created_by (created_by),
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for colleges.onboarded_by after users table is created
ALTER TABLE colleges 
ADD CONSTRAINT fk_colleges_onboarded_by 
FOREIGN KEY (onboarded_by) REFERENCES users(id);

-- ============================================================================
-- 2. EXAM PORTAL ENTITIES
-- ============================================================================

-- Table: tests
-- Description: Tests/Exams with proctoring and advanced configuration
CREATE TABLE tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    created_by BIGINT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    total_marks INT,
    published BOOLEAN,
    max_attempts INT,
    proctored BOOLEAN DEFAULT FALSE NOT NULL,
    duration_minutes INT,
    instructions TEXT,
    passing_percentage INT,
    difficulty_level VARCHAR(50),
    show_results_immediately BOOLEAN DEFAULT TRUE,
    allow_review BOOLEAN DEFAULT FALSE,
    max_violations INT DEFAULT 10,
    INDEX idx_tests_created_by (created_by),
    INDEX idx_tests_dates (start_time, end_time),
    INDEX idx_tests_published (published),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: questions
-- Description: Questions belonging to tests (7 types: MCQ, MAQ, FILL_BLANK, TRUE_FALSE, ESSAY, IMAGE_BASED, UPLOAD_ANSWER)
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id BIGINT NOT NULL,
    question_text TEXT,
    marks INT,
    negative_marks INT,
    question_type ENUM('MCQ', 'MAQ', 'FILL_BLANK', 'TRUE_FALSE', 'ESSAY', 'IMAGE_BASED', 'UPLOAD_ANSWER'),
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_option VARCHAR(1),
    correct_options_csv VARCHAR(50),
    correct_answer TEXT,
    character_limit INT,
    image_url VARCHAR(500),
    allow_file_upload BOOLEAN,
    file_upload_instructions TEXT,
    INDEX idx_questions_test (test_id),
    INDEX idx_questions_type (question_type),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: test_attempts
-- Description: Student test attempts with scoring
CREATE TABLE test_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    test_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    attempt_number INT NOT NULL,
    started_at DATETIME,
    submitted_at DATETIME,
    score INT,
    completed BOOLEAN,
    updated_at DATETIME,
    INDEX idx_attempts_test_student (test_id, student_id),
    INDEX idx_attempts_student (student_id),
    INDEX idx_attempts_completed (completed),
    UNIQUE KEY uk_attempts (test_id, student_id, attempt_number),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: answers
-- Description: Student answers to individual questions
CREATE TABLE answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_text TEXT,
    correct BOOLEAN,
    INDEX idx_answers_attempt (attempt_id),
    INDEX idx_answers_question (question_id),
    UNIQUE KEY uk_answers (attempt_id, question_id),
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: session_reports
-- Description: AI proctoring violation reports (One-to-One with test_attempts)
CREATE TABLE session_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL UNIQUE,
    heads_turned INT,
    head_tilts INT,
    look_aways INT,
    multiple_people INT,
    face_visibility_issues INT,
    mobile_detected INT,
    audio_incidents INT,
    tab_switches INT,
    window_switches INT,
    is_valid_test BOOLEAN,
    invalid_reason TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    UNIQUE KEY uk_session_reports_attempt (attempt_id),
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. LEARNING MANAGEMENT ENTITIES
-- ============================================================================

-- Table: courses
-- Description: Learning courses with topics and tests
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    created_by BIGINT NOT NULL,
    college_id BIGINT NOT NULL,
    published BOOLEAN DEFAULT FALSE NOT NULL,
    enrollment_open BOOLEAN DEFAULT TRUE,
    max_enrollment INT,
    display_order INT,
    category VARCHAR(100),
    difficulty_level VARCHAR(50),
    estimated_hours INT,
    created_at DATETIME,
    updated_at DATETIME,
    INDEX idx_courses_created_by (created_by),
    INDEX idx_courses_college (college_id),
    INDEX idx_courses_published (published),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: topics
-- Description: Learning topics containing chapters
CREATE TABLE topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    published BOOLEAN DEFAULT FALSE NOT NULL,
    display_order INT,
    created_at DATETIME,
    updated_at DATETIME,
    INDEX idx_topics_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: chapters
-- Description: Content chapters within topics
CREATE TABLE chapters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    topic_id BIGINT NOT NULL,
    display_order INT,
    created_at DATETIME,
    updated_at DATETIME,
    INDEX idx_chapters_topic (topic_id),
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: enrollments
-- Description: Student enrollments in courses
CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED') DEFAULT 'ACTIVE' NOT NULL,
    enrolled_at DATETIME,
    completed_at DATETIME,
    progress_percentage INT DEFAULT 0,
    INDEX idx_enrollments_course (course_id),
    INDEX idx_enrollments_student (student_id),
    UNIQUE KEY uk_enrollments (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: chapter_progress
-- Description: Student progress tracking for chapters
CREATE TABLE chapter_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chapter_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at DATETIME,
    last_accessed_at DATETIME,
    time_spent_seconds BIGINT DEFAULT 0,
    INDEX idx_chapter_progress_chapter (chapter_id),
    INDEX idx_chapter_progress_student (student_id),
    UNIQUE KEY uk_chapter_progress (chapter_id, student_id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: certificates
-- Description: Course completion certificates
CREATE TABLE certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    certificate_uid VARCHAR(100) NOT NULL UNIQUE,
    course_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    college_id BIGINT NOT NULL,
    issued_at DATETIME,
    student_name VARCHAR(255),
    course_title VARCHAR(255),
    college_name VARCHAR(255),
    download_url VARCHAR(500),
    INDEX idx_certificates_uid (certificate_uid),
    INDEX idx_certificates_student (student_id),
    UNIQUE KEY uk_certificates (course_id, student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. JUNCTION TABLES (Many-to-Many Relationships)
-- ============================================================================

-- Table: course_topics
-- Description: Many-to-Many relationship between courses and topics
CREATE TABLE course_topics (
    course_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    PRIMARY KEY (course_id, topic_id),
    INDEX idx_course_topics_topic (topic_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: course_tests
-- Description: Many-to-Many relationship between courses and tests
CREATE TABLE course_tests (
    course_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    PRIMARY KEY (course_id, test_id),
    INDEX idx_course_tests_test (test_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Authentication and user queries
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Test filtering and search
CREATE INDEX idx_tests_difficulty ON tests(difficulty_level);
CREATE INDEX idx_tests_proctored ON tests(proctored);

-- Course catalog queries
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_enrollment ON courses(enrollment_open);

-- Progress tracking
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_chapter_progress_completed ON chapter_progress(completed);

-- Proctoring reports
CREATE INDEX idx_session_reports_valid ON session_reports(is_valid_test);

-- ============================================================================
-- 6. DATABASE VIEWS (Optional - for common queries)
-- ============================================================================

-- View: Active students per college
CREATE OR REPLACE VIEW v_college_student_count AS
SELECT 
    c.id AS college_id,
    c.name AS college_name,
    COUNT(u.id) AS student_count
FROM colleges c
LEFT JOIN users u ON c.id = u.college_id AND u.type = 'USER' AND u.is_active = TRUE
GROUP BY c.id, c.name;

-- View: Published tests with question count
CREATE OR REPLACE VIEW v_published_tests AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.start_time,
    t.end_time,
    t.proctored,
    t.duration_minutes,
    COUNT(q.id) AS question_count,
    SUM(q.marks) AS total_marks
FROM tests t
LEFT JOIN questions q ON t.id = q.test_id
WHERE t.published = TRUE
GROUP BY t.id;

-- View: Course enrollment statistics
CREATE OR REPLACE VIEW v_course_stats AS
SELECT 
    c.id AS course_id,
    c.title AS course_title,
    c.college_id,
    COUNT(DISTINCT e.student_id) AS enrolled_students,
    COUNT(DISTINCT CASE WHEN e.status = 'COMPLETED' THEN e.student_id END) AS completed_students,
    AVG(e.progress_percentage) AS avg_progress
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE c.published = TRUE
GROUP BY c.id, c.title, c.college_id;

-- View: Student test performance
CREATE OR REPLACE VIEW v_student_test_performance AS
SELECT 
    u.id AS student_id,
    u.name AS student_name,
    u.college_id,
    t.id AS test_id,
    t.title AS test_title,
    ta.attempt_number,
    ta.score,
    t.total_marks,
    ROUND((ta.score / t.total_marks) * 100, 2) AS percentage,
    ta.submitted_at,
    sr.is_valid_test,
    sr.heads_turned + sr.head_tilts + sr.look_aways + 
    sr.multiple_people + sr.face_visibility_issues + 
    sr.mobile_detected + sr.audio_incidents AS total_violations
FROM users u
INNER JOIN test_attempts ta ON u.id = ta.student_id
INNER JOIN tests t ON ta.test_id = t.id
LEFT JOIN session_reports sr ON ta.id = sr.attempt_id
WHERE u.type = 'USER' AND ta.completed = TRUE;

-- ============================================================================
-- 7. STORED PROCEDURES (Optional - for complex operations)
-- ============================================================================

DELIMITER //

-- Procedure: Calculate and update enrollment progress
CREATE PROCEDURE sp_update_enrollment_progress(
    IN p_enrollment_id BIGINT
)
BEGIN
    DECLARE v_total_chapters INT;
    DECLARE v_completed_chapters INT;
    DECLARE v_progress INT;
    
    -- Get total chapters in enrolled course
    SELECT COUNT(DISTINCT ch.id)
    INTO v_total_chapters
    FROM enrollments e
    INNER JOIN course_topics ct ON e.course_id = ct.course_id
    INNER JOIN chapters ch ON ct.topic_id = ch.topic_id
    WHERE e.id = p_enrollment_id;
    
    -- Get completed chapters by student
    SELECT COUNT(DISTINCT cp.chapter_id)
    INTO v_completed_chapters
    FROM enrollments e
    INNER JOIN chapter_progress cp ON e.student_id = cp.student_id
    INNER JOIN course_topics ct ON e.course_id = ct.course_id
    INNER JOIN chapters ch ON ct.topic_id = ch.topic_id AND cp.chapter_id = ch.id
    WHERE e.id = p_enrollment_id AND cp.completed = TRUE;
    
    -- Calculate progress percentage
    IF v_total_chapters > 0 THEN
        SET v_progress = ROUND((v_completed_chapters / v_total_chapters) * 100);
    ELSE
        SET v_progress = 0;
    END IF;
    
    -- Update enrollment progress
    UPDATE enrollments
    SET progress_percentage = v_progress,
        status = CASE WHEN v_progress = 100 THEN 'COMPLETED' ELSE status END,
        completed_at = CASE WHEN v_progress = 100 THEN NOW() ELSE completed_at END
    WHERE id = p_enrollment_id;
END //

-- Procedure: Auto-grade objective questions
CREATE PROCEDURE sp_auto_grade_answers(
    IN p_attempt_id BIGINT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_answer_id BIGINT;
    DECLARE v_question_id BIGINT;
    DECLARE v_answer_text TEXT;
    DECLARE v_question_type VARCHAR(50);
    DECLARE v_correct_option VARCHAR(1);
    DECLARE v_correct_options_csv VARCHAR(50);
    DECLARE v_correct_answer TEXT;
    DECLARE v_marks INT;
    DECLARE v_negative_marks INT;
    DECLARE v_is_correct BOOLEAN;
    DECLARE v_total_score INT DEFAULT 0;
    
    DECLARE cur CURSOR FOR 
        SELECT a.id, a.question_id, a.answer_text, q.question_type, 
               q.correct_option, q.correct_options_csv, q.correct_answer,
               q.marks, q.negative_marks
        FROM answers a
        INNER JOIN questions q ON a.question_id = q.id
        WHERE a.attempt_id = p_attempt_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    grade_loop: LOOP
        FETCH cur INTO v_answer_id, v_question_id, v_answer_text, v_question_type,
                       v_correct_option, v_correct_options_csv, v_correct_answer,
                       v_marks, v_negative_marks;
        
        IF done THEN
            LEAVE grade_loop;
        END IF;
        
        -- Grade based on question type
        SET v_is_correct = FALSE;
        
        CASE v_question_type
            WHEN 'MCQ', 'TRUE_FALSE', 'IMAGE_BASED' THEN
                SET v_is_correct = (v_answer_text = v_correct_option);
            WHEN 'MAQ' THEN
                SET v_is_correct = (v_answer_text = v_correct_options_csv);
            WHEN 'FILL_BLANK' THEN
                SET v_is_correct = (LOWER(TRIM(v_answer_text)) = LOWER(TRIM(v_correct_answer)));
            ELSE
                SET v_is_correct = NULL; -- Essay/Upload need manual grading
        END CASE;
        
        -- Update answer correctness
        UPDATE answers
        SET correct = v_is_correct
        WHERE id = v_answer_id;
        
        -- Update score
        IF v_is_correct = TRUE THEN
            SET v_total_score = v_total_score + v_marks;
        ELSEIF v_is_correct = FALSE THEN
            SET v_total_score = v_total_score - v_negative_marks;
        END IF;
    END LOOP;
    
    CLOSE cur;
    
    -- Update attempt total score
    UPDATE test_attempts
    SET score = v_total_score
    WHERE id = p_attempt_id;
END //

DELIMITER ;

-- ============================================================================
-- 8. TRIGGERS (Optional - for audit and automation)
-- ============================================================================

DELIMITER //

-- Trigger: Update test total_marks when questions are added/updated
CREATE TRIGGER trg_update_test_marks
AFTER INSERT ON questions
FOR EACH ROW
BEGIN
    UPDATE tests
    SET total_marks = (
        SELECT SUM(marks)
        FROM questions
        WHERE test_id = NEW.test_id
    )
    WHERE id = NEW.test_id;
END //

-- Trigger: Auto-set timestamps on user creation
CREATE TRIGGER trg_users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.created_at IS NULL THEN
        SET NEW.created_at = NOW();
    END IF;
END //

-- Trigger: Update last_accessed_at on chapter_progress
CREATE TRIGGER trg_chapter_progress_before_update
BEFORE UPDATE ON chapter_progress
FOR EACH ROW
BEGIN
    SET NEW.last_accessed_at = NOW();
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        SET NEW.completed_at = NOW();
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Display summary
SELECT 'BKIT LMS Database Schema Created Successfully!' AS Status;
SELECT COUNT(*) AS TableCount FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE';
