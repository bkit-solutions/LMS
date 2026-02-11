# BKIT LMS V1 Launch Proposal

## Business Model & Role Hierarchy

### Multi-Tenant College-Based Architecture
- **No Subscription Model**: Access control at college level (enable/disable per college)
- **College as Tenant**: Each college is a separate tenant with custom branding
- **Onboarding Process**: Colleges onboarded individually with custom configuration

### Role Hierarchy & Responsibilities

#### **Root Admin** (System Level)
- **Purpose**: System initialization and Super Admin creation
- **Access**: Create Super Admins only
- **Scope**: Global system administration

#### **Super Admin (SA)** (BKIT Solutions Staff)
- **Purpose**: LMS platform management and client support
- **Access**: Full system access, college onboarding, global analytics
- **Responsibilities**:
  - College onboarding and configuration
  - System monitoring and maintenance
  - Client support and issue resolution
  - Global reporting and analytics

#### **Admin** (College IT Admin - Clients)
- **Purpose**: College-level administration and faculty management
- **Access**: Limited to their college's data and users
- **Responsibilities**:
  - Faculty user creation and management
  - College branding customization
  - Course and content oversight
  - College-level reporting

#### **Faculty** (College Staff)
- **Purpose**: Content creation and test management
- **Access**: Limited to assigned courses and tests within their college
- **Responsibilities**:
  - Course content creation and management
  - Test creation and proctoring setup
  - Student performance monitoring
  - Content delivery

#### **Students** (End Users)
- **Purpose**: Learning and assessment
- **Access**: Limited to enrolled courses and assigned tests
- **Activities**: Course consumption, test taking, progress tracking

### College-Specific Branding Requirements
- **Custom Navbar**: College name, logo, and branding colors
- **Banner/Header**: College-specific visual identity
- **Login Page**: College-branded authentication
- **Certificate Templates**: College-branded certificates
- **Email Templates**: College-branded communications

## Current Project Status

### Existing Database Schema

#### **users** Table (Enhanced for College Association)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    type ENUM('ROOTADMIN', 'SUPERADMIN', 'ADMIN', 'FACULTY', 'USER') NOT NULL,
    college_id BIGINT, -- NULL for ROOTADMIN/SUPERADMIN, required for others
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    date_of_birth DATE,
    address VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (college_id) REFERENCES colleges(id)
);
```

#### **colleges** Table (NEW - Multi-Tenant Container)
```sql
CREATE TABLE colleges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- Short code for URLs/branding
    description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    primary_color VARCHAR(7), -- Hex color code
    secondary_color VARCHAR(7),
    domain VARCHAR(255), -- College domain for email validation
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    onboarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    onboarded_by BIGINT NOT NULL, -- Super Admin who onboarded
    FOREIGN KEY (onboarded_by) REFERENCES users(id)
);
```

#### **topics** Table
```sql
CREATE TABLE topics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    college_id BIGINT NOT NULL, -- College-specific topics
    published BOOLEAN DEFAULT true,
    display_order INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (college_id) REFERENCES colleges(id)
);
```

#### **chapters** Table
```sql
CREATE TABLE chapters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    topic_id BIGINT NOT NULL,
    display_order INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

#### **tests** Table
```sql
CREATE TABLE tests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    created_by BIGINT NOT NULL,
    college_id BIGINT NOT NULL, -- College-specific tests
    start_time DATETIME,
    end_time DATETIME,
    total_marks INT,
    published BOOLEAN,
    max_attempts INT,
    proctored BOOLEAN DEFAULT false,
    duration_minutes INT,
    instructions TEXT,
    passing_percentage INT,
    difficulty_level VARCHAR(50),
    show_results_immediately BOOLEAN DEFAULT true,
    allow_review BOOLEAN DEFAULT false,
    max_violations INT DEFAULT 5,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (college_id) REFERENCES colleges(id)
);
```

#### **questions** Table
```sql
CREATE TABLE questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_id BIGINT NOT NULL,
    question_text TEXT,
    marks INT,
    negative_marks INT,
    question_type ENUM('MCQ', 'MAQ', 'FILL_BLANK'),
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_option VARCHAR(10),
    correct_options_csv VARCHAR(50),
    correct_answer VARCHAR(500),
    FOREIGN KEY (test_id) REFERENCES tests(id)
);
```

#### **test_attempts** Table
```sql
CREATE TABLE test_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    test_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    attempt_number INT NOT NULL,
    started_at DATETIME,
    submitted_at DATETIME,
    score INT,
    completed BOOLEAN,
    updated_at TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);
```

#### **answers** Table
```sql
CREATE TABLE answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_text VARCHAR(1000),
    correct BOOLEAN,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

#### **session_reports** Table
```sql
CREATE TABLE session_reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attempt_id BIGINT NOT NULL UNIQUE,
    heads_turned INT,
    head_tilts INT,
    look_aways INT,
    multiple_people INT,
    face_visibility_issues INT,
    mobile_detected INT,
    audio_incidents INT,
    is_valid_test BOOLEAN,
    invalid_reason TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id)
);
```

### Current System Capabilities ✅

#### **User Management**
- Complete user lifecycle with role-based access (ROOTADMIN/SUPERADMIN/ADMIN/USER)
- User profiles with contact information and bio
- Hierarchical user creation (SuperAdmin → Admin → Users)

#### **Content Structure**
- Hierarchical organization: Topics → Chapters
- Rich text content in chapters
- Content ordering and publishing controls

#### **Test Engine**
- Comprehensive test configuration (timing, attempts, difficulty)
- AI-powered proctoring with 7 violation types
- Real-time violation enforcement with auto-submit
- Flexible scoring and result display options

#### **Question Management**
- Three question types: MCQ, MAQ (multiple correct), Fill-in-blank
- Flexible scoring with negative marks
- Rich question configuration

#### **Assessment Features**
- Full attempt lifecycle with time tracking
- Answer validation and scoring
- Session monitoring and violation reporting
- Result analytics and session validity assessment

### Current System Limitations ❌

#### **What It CANNOT Do**
- **No College Multi-Tenancy**: No college container or tenant isolation
- **No College Branding**: No custom logos, colors, or navbar customization
- **No Faculty Role**: No dedicated faculty user type for content creators
- **No College-Based Access Control**: No tenant-level data isolation
- **No Enrollment Control**: Any enrolled student can access any published test
- **No Progress Tracking**: No completion metrics or learning progress indicators
- **No Multimedia Content**: Only text content, no file uploads or media support
- **No Question Reuse**: Questions are permanently tied to specific tests
- **No Completion Recognition**: No certificates or achievement validation
- **No Learning Analytics**: Basic test results only, no learning insights

## V1 Addons Required

### Core Addons (Must-Have for LMS Functionality)

#### 1. **College Multi-Tenant System**
**Purpose**: Enable college-based tenant isolation and management
**Required Components**:
- College entity with branding configuration
- College onboarding workflow
- College-specific data isolation
- College enable/disable functionality

#### 2. **Enhanced Role Hierarchy**
**Purpose**: Support complete role structure with Faculty role
**Required Components**:
- Faculty role addition to user types
- College association for all users (except Root/SA)
- Role-based permission matrix
- Hierarchical user creation workflows

#### 3. **College Branding System**
**Purpose**: Custom visual identity per college
**Required Components**:
- Logo and banner upload/management
- Color scheme customization
- Navbar branding integration
- Certificate template branding

#### 4. **Course Management System**
**Purpose**: Container for organizing topics into structured courses
**Required Components**:
- Course entity with metadata (title, description, instructor, thumbnail)
- Course publishing and enrollment settings
- Link topics to courses for organization
- College-specific course isolation

#### 5. **Enrollment & Access Control**
**Purpose**: Control who can access what content and tests
**Required Components**:
- Course enrollment tracking
- Enrollment-based content access
- Test access restricted to enrolled students
- College-based visibility controls

#### 6. **Progress Tracking**
**Purpose**: Monitor student completion and learning progress
**Required Components**:
- Chapter completion status
- Course progress percentage
- Learning path navigation
- Completion timestamps

#### 7. **Multimedia Content Support**
**Purpose**: Enable rich content delivery beyond text
**Required Components**:
- File upload system for videos, PDFs, images
- Content storage and serving
- Media player integration
- File type validation and security

#### 8. **Question Bank System**
**Purpose**: Enable question reuse and randomization
**Required Components**:
- Centralized question repository
- Question categorization and tagging
- Random question selection for tests
- Question difficulty management

#### 9. **Certificate Generation**
**Purpose**: Provide completion recognition and validation
**Required Components**:
- College-branded certificate templates
- Automatic awarding on completion
- Certificate download and verification
- Course/test completion tracking

### Enhanced Addons (Should-Have for Competitive Edge)

#### 10. **Advanced Question Types**
- Essay questions with rich text input
- Image-based questions
- Coding/programming challenges

#### 11. **Learning Analytics**
- Student performance dashboards
- Course engagement metrics
- Instructor analytics tools
- Progress trend analysis

#### 12. **Communication Tools**
- Course announcements
- Basic messaging system
- Notification preferences

### Future Addons (Nice-to-Have)

#### 13. **Discussion Forums**
- Threaded course discussions
- Instructor moderation tools
- Student collaboration features

#### 14. **Mobile Application**
- Native iOS/Android apps
- Offline content access
- Push notifications

#### 15. **Advanced Proctoring**
- Audio monitoring
- Screen sharing capabilities
- Behavioral analysis enhancements

## V1 Launch Requirements Summary

### Minimum Viable LMS Features
To launch V1, the system must support this complete workflow:
1. **College Onboarding** → Super Admin enables college with branding
2. **Browse Courses** → Student discovers available courses within their college
3. **Enroll** → Student joins course with access granted
4. **Access Content** → Student views multimedia content with progress tracking
5. **Take Tests** → Student accesses enrolled course tests with proctoring
6. **Get Certificate** → Automatic college-branded certificate generation

### Current System Status
- **Test Platform**: ✅ Fully functional with advanced proctoring
- **Content Repository**: ⚠️ Basic text content only
- **Multi-Tenancy**: ❌ No college isolation or branding
- **Role Hierarchy**: ❌ Missing Faculty role and college association
- **Learning Management**: ❌ Missing course structure and access control
- **Progress Tracking**: ❌ No completion or progress metrics
- **Achievement System**: ❌ No certificates or recognition

### V1 Success Criteria
- Complete college onboarding to certificate workflow
- College-based tenant isolation with custom branding
- Complete role hierarchy (Root → SA → Admin → Faculty → Student)
- Enrollment-based access control for content and tests
- Progress tracking through multimedia content
- College-branded certificate generation and download
- Mobile-responsive interface
- Stable performance for concurrent users across colleges

---

## V1 Implementation Status ✅

### Completed in V1 (Current Build)

#### Backend (Spring Boot)
| Feature | Status | Details |
|---------|--------|---------|
| College Entity & CRUD | ✅ | Full college onboarding, branding config, toggle active |
| FACULTY Role | ✅ | Added to UserType enum, JWT claims include college info |
| Course Management | ✅ | Create/update/delete courses linked to topics & tests |
| Enrollment System | ✅ | Enroll/unenroll, college-match validation, max-enrollment check |
| Progress Tracking | ✅ | Chapter completion, time spent tracking, course % calc |
| Certificate System | ✅ | Issue on enrollment completion, UUID-based public verification |
| College Branding API | ✅ | Public endpoint for college branding by code |
| Role-Based Security | ✅ | JWT with collegeId/collegeName/collegeCode claims |

#### Frontend (React + TypeScript)
| Feature | Status | Details |
|---------|--------|---------|
| College Management Page | ✅ | SuperAdmin college CRUD with status toggle |
| Course Management Page | ✅ | Admin/Faculty course creation with topic/test linking |
| Student Courses Page | ✅ | Enrolled/browse tabs, enroll/unenroll, progress display |
| Student Certificates Page | ✅ | Certificate gallery with download & copy UID |
| Navbar Updates | ✅ | College branding badge, FACULTY nav, Courses/Certificates nav |
| Dashboard Updates | ✅ | Stats cards, quick nav for all roles |
| API Services | ✅ | College, Course, Enrollment, Certificate API layers |
| Auth State | ✅ | College info in Redux, createFaculty thunk |

### V1 Remaining Items ⚠️
| Feature | Priority | Notes |
|---------|----------|-------|
| Multimedia Upload | HIGH | File upload for videos/PDFs/images in chapters |
| Question Bank | MEDIUM | Decouple questions from tests for reuse |
| College-Branded Login | MEDIUM | Dynamic login page per college subdomain/code |
| Email Notifications | LOW | Enrollment confirmations, certificate issued |

---

## V2 Roadmap — BKIT LMS V2 Proposal

### V2 Vision
Transform the LMS from an assessment-focused platform to a comprehensive learning ecosystem with advanced content delivery, analytics, collaboration, and mobile-first experience.

### V2 Timeline: Q3–Q4 2025

---

### V2 Core Features

#### 1. **Advanced Question Types & Assessment Engine**
**Priority**: HIGH | **Effort**: 4–6 weeks

- **Essay/Subjective Questions**: Rich text editor for long-form answers with manual/AI-assisted grading
- **Image-Based Questions**: Upload images as part of question stems, drag-and-drop matching
- **Coding Challenges**: Embedded code editor with language support (Java, Python, C++), auto-evaluation via sandboxed execution
- **Question Bank & Randomization**: Centralized question repository with tags, difficulty levels, topic mapping; random question pools per test
- **Adaptive Testing**: Questions adjust difficulty based on student performance in real-time

#### 2. **Rich Multimedia Content Engine**
**Priority**: HIGH | **Effort**: 6–8 weeks

- **Video Lectures**: Upload & stream video content with progress tracking, playback speed control
- **PDF Viewer**: In-browser PDF reading with annotation support
- **Interactive Content**: Embedded quizzes within chapters, interactive diagrams
- **Content Versioning**: Track changes, rollback, and audit trail for all content
- **CDN Integration**: S3/CloudFront or equivalent for media storage and fast delivery
- **SCORM/xAPI Support**: Import industry-standard e-learning packages

#### 3. **Learning Analytics Dashboard**
**Priority**: HIGH | **Effort**: 4–5 weeks

- **Student Analytics**: Learning time distribution, topic mastery heatmaps, performance trends
- **Instructor Analytics**: Content engagement metrics, question difficulty analysis, class performance distribution
- **College Analytics (SA)**: Cross-college benchmarking, enrollment trends, completion rates
- **Predictive Analytics**: At-risk student identification, course completion probability
- **Exportable Reports**: PDF/CSV reports for stakeholders

#### 4. **Communication & Collaboration Platform**
**Priority**: MEDIUM | **Effort**: 4–5 weeks

- **Course Announcements**: Faculty can post announcements to enrolled students
- **Discussion Forums**: Threaded discussions per course/topic with upvoting, pinning, and moderation
- **Direct Messaging**: Student-to-faculty messaging with read receipts
- **Notification Center**: In-app + email + push notification system with preferences
- **Activity Feed**: Real-time feed of course activities, new content, and deadlines

#### 5. **Assignment & Submission System**
**Priority**: MEDIUM | **Effort**: 3–4 weeks

- **Assignment Creation**: Faculty creates assignments with due dates, file type restrictions, rubrics
- **File Submission**: Students upload assignments (docs, code, PDFs)
- **Plagiarism Detection**: Basic similarity checking across submissions
- **Grading Workflow**: Inline feedback, rubric-based grading, grade release scheduling
- **Peer Review**: Optional peer assessment with anonymized reviews

#### 6. **Advanced Proctoring 2.0**
**Priority**: MEDIUM | **Effort**: 3–4 weeks

- **Audio Monitoring**: Detect conversations, background noise anomalies
- **Screen Recording**: Capture student screen during proctored tests (opt-in)
- **Behavioral Pattern Analysis**: ML-based anomaly detection for cheating patterns
- **Live Proctoring Mode**: Faculty can monitor active test sessions in real-time
- **Proctoring Reports**: Detailed violation timeline with video snippets

---

### V2 Platform Enhancements

#### 7. **Mobile Application**
**Priority**: HIGH | **Effort**: 8–10 weeks

- **React Native App**: Cross-platform iOS/Android with shared codebase
- **Offline Mode**: Download courses/chapters for offline study, sync progress on reconnect
- **Push Notifications**: Test reminders, grade releases, announcement alerts
- **Camera Integration**: Mobile proctoring support
- **Biometric Auth**: Fingerprint/FaceID login

#### 8. **API Gateway & Microservices Migration**
**Priority**: MEDIUM | **Effort**: 6–8 weeks

- **API Gateway**: Rate limiting, request routing, API versioning
- **Service Decomposition**: Auth Service, Content Service, Assessment Service, Analytics Service
- **Event-Driven Architecture**: Kafka/RabbitMQ for async processing (grading, notifications, analytics)
- **Caching Layer**: Redis for session management, frequently accessed content, and API response caching
- **Database Per Service**: Separate databases for content, assessment, and user management

#### 9. **Infrastructure & DevOps**
**Priority**: HIGH | **Effort**: 3–4 weeks

- **CI/CD Pipeline**: GitHub Actions → Docker → Kubernetes (or ECS)
- **Environment Management**: Dev, Staging, Production with feature flags
- **Monitoring & Alerting**: Prometheus + Grafana, application health dashboards
- **Log Aggregation**: ELK Stack or CloudWatch for centralized logging
- **Auto-Scaling**: Horizontal scaling for concurrent college usage spikes
- **Disaster Recovery**: Automated backups, multi-AZ deployment

#### 10. **Accessibility & Internationalization**
**Priority**: MEDIUM | **Effort**: 2–3 weeks

- **WCAG 2.1 AA Compliance**: Screen reader support, keyboard navigation, contrast ratios
- **Multi-Language Support**: i18n framework for Hindi, Marathi, and other regional languages
- **RTL Layout Support**: Right-to-left text rendering where needed
- **Font Size Controls**: User-adjustable text sizing

---

### V2 Integrations

#### 11. **Third-Party Integrations**
- **Google Workspace**: SSO via Google, Drive integration for content
- **Microsoft Teams/Zoom**: Virtual classroom scheduling and launch
- **Payment Gateway**: Razorpay/Stripe for premium course monetization (opt-in per college)
- **SMS Service**: Twilio/MSG91 for OTP-based login and alerts
- **Cloud Storage**: AWS S3 / Google Cloud Storage for content delivery

#### 12. **Webhooks & Developer API**
- **Public API**: REST API with OAuth2 for third-party integrations
- **Webhooks**: Event-driven callbacks for enrollment, completion, grading events
- **Embed SDK**: Allow colleges to embed LMS widgets in their existing portals
- **Bulk Operations API**: CSV/Excel import for users, questions, enrollments

---

### V2 Success Metrics

| Metric | Target |
|--------|--------|
| Content Types Supported | 5+ (text, video, PDF, code, interactive) |
| Average Page Load Time | < 2 seconds |
| Mobile App Rating | 4.0+ stars |
| Concurrent Users Per College | 500+ |
| System Uptime | 99.9% |
| Question Bank Size Support | 10,000+ per college |
| API Response Time (p95) | < 300ms |
| Proctoring Accuracy | > 95% violation detection |

### V2 Tech Stack Additions
| Layer | Current (V1) | Planned (V2) |
|-------|-------------|--------------|
| Backend | Spring Boot Monolith | Spring Boot Microservices |
| Database | MySQL (single) | MySQL + Redis + Elasticsearch |
| Storage | Local/DB | AWS S3 + CloudFront CDN |
| Messaging | — | Kafka / RabbitMQ |
| Mobile | Responsive Web | React Native App |
| Monitoring | — | Prometheus + Grafana |
| CI/CD | Docker Compose | GitHub Actions + K8s |
| Search | SQL LIKE | Elasticsearch |
| Auth | JWT (stateless) | JWT + OAuth2 + SSO |
