export const UserCreationMode = {
  INIT_ROOT_ADMIN: "INIT_ROOT_ADMIN",
  CREATE_SUPER_ADMIN: "CREATE_SUPER_ADMIN",
  CREATE_ADMIN: "CREATE_ADMIN",
  CREATE_FACULTY: "CREATE_FACULTY",
  CREATE_USER: "CREATE_USER",
} as const;

export type UserCreationModeType =
  (typeof UserCreationMode)[keyof typeof UserCreationMode];

export const QuestionType = {
  MCQ: "MCQ",
  MAQ: "MAQ",
  FILL_BLANK: "FILL_BLANK",
  TRUE_FALSE: "TRUE_FALSE",
  ESSAY: "ESSAY",
  IMAGE_BASED: "IMAGE_BASED",
  UPLOAD_ANSWER: "UPLOAD_ANSWER",
} as const;

export type QuestionTypeType = (typeof QuestionType)[keyof typeof QuestionType];

export const UserRole = {
  ROOTADMIN: "ROOTADMIN",
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  FACULTY: "FACULTY",
  USER: "USER",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export interface Test {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  published: boolean;
  maxAttempts: number;
  createdBy: number;
  proctored: boolean;
  durationMinutes?: number; // Test duration in minutes (null/undefined = unlimited)
  instructions?: string; // Detailed test instructions
  passingPercentage?: number; // Minimum percentage to pass
  difficultyLevel?: string; // EASY, MEDIUM, HARD
  showResultsImmediately?: boolean;
  allowReview?: boolean;
}

export interface CreateTestRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  published: boolean;
  maxAttempts: number;
  proctored: boolean;
  durationMinutes?: number;
  instructions?: string;
  passingPercentage?: number;
  difficultyLevel?: string;
  showResultsImmediately?: boolean;
  allowReview?: boolean;
}

export interface UpdateTestRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  totalMarks?: number;
  published?: boolean;
  maxAttempts?: number;
  proctored?: boolean;
  durationMinutes?: number;
  instructions?: string;
  passingPercentage?: number;
  difficultyLevel?: string;
  showResultsImmediately?: boolean;
  allowReview?: boolean;
}

export interface Question {
  id: number;
  testId: number;
  questionType: QuestionTypeType;
  questionText: string;
  marks: number;
  negativeMarks: number;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
  correctOptionsCsv?: string;
  correctAnswer?: string;
  characterLimit?: number;
  imageUrl?: string;
  allowFileUpload?: boolean;
  fileUploadInstructions?: string;
}

export interface CreateQuestionRequest {
  questionType: QuestionTypeType;
  questionText: string;
  marks: number;
  negativeMarks: number;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
  correctOptionsCsv?: string;
  correctAnswer?: string;
  characterLimit?: number;
  imageUrl?: string;
  allowFileUpload?: boolean;
  fileUploadInstructions?: string;
}

export interface UpdateQuestionRequest {
  questionType?: QuestionTypeType;
  questionText?: string;
  marks?: number;
  negativeMarks?: number;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: string;
  correctOptionsCsv?: string;
  correctAnswer?: string;
  characterLimit?: number;
  imageUrl?: string;
  allowFileUpload?: boolean;
  fileUploadInstructions?: string;
}

export interface Attempt {
  id: number;
  testId: number;
  userId: number;
  attemptNumber: number;
  durationMinutes?: number; // Test duration
  startedAt: string;
  submittedAt?: string;
  score?: number;
  maxScore: number;
  completed: boolean;
  proctored?: boolean; // Whether this test requires proctoring
  maxViolations?: number; // Max allowed violations
  answers?: Answer[]; // Optional answers field if returned
}

export interface Answer {
  id: number;
  attemptId: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  marksObtained: number;
}

export interface SubmitAnswerRequest {
  questionId: number;
  answerText: string;
}

export interface SessionReport {
  id: number;
  attemptId: number;
  headsTurned: number;
  headTilts: number;
  lookAways: number;
  multiplePeople: number;
  faceVisibilityIssues: number;
  mobileDetected: number;
  audioIncidents: number;
  tabSwitches: number;
  windowSwitches: number;
  isValidTest?: boolean;
  invalidReason?: string;
}

export interface UpdateSessionReportRequest {
  headsTurned?: number;
  headTilts?: number;
  lookAways?: number;
  multiplePeople?: number;
  faceVisibilityIssues?: number;
  mobileDetected?: number;
  audioIncidents?: number;
}

export interface FinalizeSessionReportRequest {
  isValidTest: boolean;
  invalidReason?: string;
}

export interface Result {
  id: number;
  test: {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    totalMarks: number;
    published: boolean;
    maxAttempts: number;
    createdBy: any; // Using any to handle nested user object structure
  };
  student: {
    id: number;
    email: string;
    name: string;
    type: string;
  };
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  score: number;
  completed: boolean;
  updatedAt: string;
  isValidTest?: boolean;
}

export interface AttemptInfo {
  id: number;
  attemptNumber: number;
  completed: boolean;
  startedAt: string | null;
  submittedAt: string | null;
  updatedAt: string | null;
  proctored?: boolean;
  durationMinutes?: number;
  maxViolations?: number;
}

export interface AttemptStateResponse {
  attempt: AttemptInfo;
  questions: Question[];
  answers: Record<string, string>;
}

// User Profile Interfaces
export interface UserProfile {
  id: number;
  email: string;
  name: string;
  type: UserRoleType;
  phoneNumber?: string;
  profilePictureUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Topics & Chapters
export interface TopicResponse {
  id: number;
  title: string;
  description: string;
  published: boolean;
  displayOrder: number;
  courseId: number;
  courseTitle: string;
  createdById: number;
  createdByName: string;
  collegeId?: number;
  collegeName?: string;
  createdAt: string;
  updatedAt: string;
  chapterCount: number;
}

export interface CreateTopicRequest {
  title: string;
  description?: string;
  published?: boolean;
  displayOrder?: number;
  courseId: number; // Required - topic must belong to a course
}

export interface UpdateTopicRequest {
  title?: string;
  description?: string;
  published?: boolean;
  displayOrder?: number;
}

export type ContentType = 'TEXT' | 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'MIXED';

export interface ChapterResponse {
  id: number;
  title: string;
  content: string;
  contentType: ContentType;
  videoUrl?: string;
  videoPlatform?: string;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  testId?: number;
  estimatedMinutes?: number;
  isMandatory?: boolean;
  topicId: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterSummary {
  id: number;
  title: string;
  contentType: ContentType;
  estimatedMinutes?: number;
  isMandatory?: boolean;
  displayOrder: number;
}

export interface CreateChapterRequest {
  title: string;
  content?: string;
  contentType?: ContentType;
  videoUrl?: string;
  videoPlatform?: string;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  testId?: number;
  estimatedMinutes?: number;
  isMandatory?: boolean;
  displayOrder?: number;
}

export interface UpdateChapterRequest {
  title?: string;
  content?: string;
  contentType?: ContentType;
  videoUrl?: string;
  videoPlatform?: string;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  testId?: number;
  estimatedMinutes?: number;
  isMandatory?: boolean;
  displayOrder?: number;
}

// ========================
// V1: College Multi-Tenant Types
// ========================

export interface College {
  id: number;
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  onboardedAt?: string;
  onboardedById?: number;
  onboardedByName?: string;
  totalUsers: number;
  totalCourses: number;
}

export interface CreateCollegeRequest {
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateCollegeRequest {
  name?: string;
  code?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
}

export interface CollegeBranding {
  id: number;
  name: string;
  code: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface CollegeStatistics {
  collegeId: number;
  collegeName: string;
  collegeCode: string;
  totalUsers: number;
  totalAdmins: number;
  totalFaculty: number;
  totalStudents: number;
  totalCourses: number;
  totalTests: number;
  totalEnrollments: number;
  activeUsers: number;
  inactiveUsers: number;
  createdAt?: string;
  lastUpdated?: string;
}

// ========================
// V1: Course Management Types
// ========================

export const CourseStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type CourseStatusType = (typeof CourseStatus)[keyof typeof CourseStatus];

export interface CourseResponse {
  id: number;
  title: string;
  courseCode?: string;
  description?: string;
  thumbnailUrl?: string;
  createdById: number;
  createdByName: string;
  collegeId: number;
  collegeName: string;
  status: CourseStatusType;
  published: boolean;
  enrollmentOpen: boolean;
  maxEnrollment?: number;
  displayOrder?: number;
  category?: string;
  department?: string;
  semester?: string;
  credits?: number;
  difficultyLevel?: string;
  estimatedHours?: number;
  prerequisites?: string;
  learningObjectives?: string;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
  topicCount: number;
  testCount: number;
  enrollmentCount: number;
}

export interface TopicWithChaptersResponse {
  id: number;
  title: string;
  description?: string;
  published: boolean;
  displayOrder?: number;
  createdById: number;
  createdByName: string;
  chapterCount: number;
  chapters: ChapterResponse[];
}

export interface CourseDetailResponse {
  id: number;
  title: string;
  courseCode?: string;
  description?: string;
  thumbnailUrl?: string;
  createdById: number;
  createdByName: string;
  collegeId: number;
  collegeName: string;
  status: CourseStatusType;
  published: boolean;
  enrollmentOpen: boolean;
  maxEnrollment?: number;
  category?: string;
  department?: string;
  semester?: string;
  credits?: number;
  difficultyLevel?: string;
  estimatedHours?: number;
  prerequisites?: string;
  learningObjectives?: string;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
  topics?: TopicWithChaptersResponse[];
  enrollmentCount: number;
  isEnrolled: boolean;
  progressPercentage?: number;
}

export interface CreateCourseRequest {
  title: string;
  courseCode?: string;
  description?: string;
  thumbnailUrl?: string;
  published?: boolean;
  enrollmentOpen?: boolean;
  maxEnrollment?: number;
  displayOrder?: number;
  category?: string;
  department?: string;
  semester?: string;
  credits?: number;
  difficultyLevel?: string;
  estimatedHours?: number;
  prerequisites?: string;
  learningObjectives?: string;
  tags?: string;
  status?: CourseStatusType;
  collegeId?: number;
  topicIds?: number[];
  testIds?: number[];
}

export interface UpdateCourseRequest {
  title?: string;
  courseCode?: string;
  description?: string;
  thumbnailUrl?: string;
  published?: boolean;
  enrollmentOpen?: boolean;
  maxEnrollment?: number;
  displayOrder?: number;
  category?: string;
  department?: string;
  semester?: string;
  credits?: number;
  difficultyLevel?: string;
  estimatedHours?: number;
  prerequisites?: string;
  learningObjectives?: string;
  tags?: string;
  status?: CourseStatusType;
  topicIds?: number[];
  testIds?: number[];
}

// ========================
// V1: Enrollment Types
// ========================

export interface EnrollmentResponse {
  id: number;
  courseId: number;
  courseTitle: string;
  courseThumbnailUrl?: string;
  studentId: number;
  studentName: string;
  studentEmail?: string;
  status: string;
  enrolledAt?: string;
  completedAt?: string;
  progressPercentage: number;
}

export interface ProgressResponse {
  courseId: number;
  courseTitle: string;
  totalChapters: number;
  completedChapters: number;
  progressPercentage: number;
  status: string;
}

export interface CourseStatsResponse {
  courseId: number;
  courseTitle: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  completionRate: number;
  totalTopics: number;
  totalChapters: number;
  totalTests: number;
  published: boolean;
  enrollmentOpen: boolean;
  status: CourseStatusType;
}

export interface DashboardStatsResponse {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalTopics: number;
  totalChapters: number;
  categoryDistribution: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface EnrollmentStatsResponse {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  completionRate: number;
  totalCourses: number;
}

// ========================
// V1: Certificate Types
// ========================

export interface CertificateResponse {
  id: number;
  certificateUid: string;
  courseId: number;
  courseTitle: string;
  studentId: number;
  studentName: string;
  collegeId: number;
  collegeName: string;
  collegeLogoUrl?: string;
  issuedAt?: string;
  downloadUrl?: string;
}

export interface CertificateVerifyResponse {
  valid: boolean;
  studentName: string;
  courseTitle: string;
  collegeName: string;
  issuedAt?: string;
}
