package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.model.*;
import in.bkitsolutions.lmsbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataInitializationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void initializeAllData() {
        // Check if data already exists
        if (userRepository.existsByType(UserType.ROOTADMIN)) {
            System.out.println("Data already exists. Skipping initialization.");
            return;
        }

        System.out.println("Initializing dummy data...");

        // Step 1: Create Root Admin
        User rootAdmin = createRootAdmin();

        // Step 2: Create Super Admins
        List<User> superAdmins = createSuperAdmins(rootAdmin);

        // Step 3: Create Colleges
        List<College> colleges = createColleges(superAdmins.get(0));

        // Step 4: Create College Admins
        List<User> collegeAdmins = createCollegeAdmins(colleges, superAdmins.get(0));

        // Step 5: Create Faculty members
        List<User> facultyMembers = createFacultyMembers(colleges, collegeAdmins);

        // Step 6: Create Students
        List<User> students = createStudents(colleges, collegeAdmins);

        // Step 7: Create sample courses and content
        createSampleCoursesAndContent(colleges, facultyMembers);

        System.out.println("Data initialization completed successfully!");
        printLoginCredentials();
    }

    private User createRootAdmin() {
        User rootAdmin = User.builder()
                .email("root@bkitsolutions.in")
                .name("Root Administrator")
                .passwordHash(passwordEncoder.encode("rootadmin123"))
                .type(UserType.ROOTADMIN)
                .college(null)
                .isActive(true)
                .phoneNumber("+91-9999999999")
                .bio("System Root Administrator")
                .address("BKIT Solutions HQ")
                .city("Hyderabad")
                .country("India")
                .createdAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .build();
        return userRepository.save(rootAdmin);
    }

    private List<User> createSuperAdmins(User rootAdmin) {
        List<User> superAdmins = new ArrayList<>();

        User superAdmin1 = User.builder()
                .email("superadmin@bkitsolutions.in")
                .name("Super Administrator")
                .passwordHash(passwordEncoder.encode("superadmin123"))
                .type(UserType.SUPERADMIN)
                .college(null)
                .isActive(true)
                .phoneNumber("+91-9876543210")
                .bio("Primary Super Administrator")
                .address("Tech Park, Hyderabad")
                .city("Hyderabad")
                .country("India")
                .createdAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .createdBy(rootAdmin)
                .build();
        superAdmins.add(userRepository.save(superAdmin1));

        User superAdmin2 = User.builder()
                .email("superadmin2@bkitsolutions.in")
                .name("Super Administrator 2")
                .passwordHash(passwordEncoder.encode("superadmin123"))
                .type(UserType.SUPERADMIN)
                .college(null)
                .isActive(true)
                .phoneNumber("+91-9876543211")
                .bio("Secondary Super Administrator")
                .address("IT Hub, Bangalore")
                .city("Bangalore")
                .country("India")
                .createdAt(LocalDateTime.now())
                .lastLogin(LocalDateTime.now())
                .createdBy(rootAdmin)
                .build();
        superAdmins.add(userRepository.save(superAdmin2));

        return superAdmins;
    }

    private List<College> createColleges(User superAdmin) {
        List<College> colleges = new ArrayList<>();

        College college1 = College.builder()
                .name("BKIT Engineering College")
                .code("BKIT")
                .description("Premier Engineering Institute")
                .logoUrl("/assets/colleges/bkit-logo.png")
                .bannerUrl("/assets/colleges/bkit-banner.jpg")
                .primaryColor("#1f2937")
                .secondaryColor("#3b82f6")
                .domain("bkit.edu.in")
                .address("Tech City, Hyderabad, Telangana")
                .contactEmail("info@bkit.edu.in")
                .contactPhone("+91-40-12345678")
                .isActive(true)
                .onboardedBy(superAdmin)
                .onboardedAt(LocalDateTime.now())
                .build();
        colleges.add(collegeRepository.save(college1));

        College college2 = College.builder()
                .name("Digital University")
                .code("DU")
                .description("Modern Digital Learning Institute")
                .logoUrl("/assets/colleges/du-logo.png")
                .bannerUrl("/assets/colleges/du-banner.jpg")
                .primaryColor("#059669")
                .secondaryColor("#10b981")
                .domain("du.edu.in")
                .address("Digital Campus, Bangalore, Karnataka")
                .contactEmail("contact@du.edu.in")
                .contactPhone("+91-80-87654321")
                .isActive(true)
                .onboardedBy(superAdmin)
                .onboardedAt(LocalDateTime.now())
                .build();
        colleges.add(collegeRepository.save(college2));

        College college3 = College.builder()
                .name("Tech Institute")
                .code("TI")
                .description("Advanced Technology Institute")
                .logoUrl("/assets/colleges/ti-logo.png")
                .bannerUrl("/assets/colleges/ti-banner.jpg")
                .primaryColor("#7c3aed")
                .secondaryColor("#8b5cf6")
                .domain("techins.edu.in")
                .address("Innovation Park, Chennai, Tamil Nadu")
                .contactEmail("admin@techins.edu.in")
                .contactPhone("+91-44-11223344")
                .isActive(true)
                .onboardedBy(superAdmin)
                .onboardedAt(LocalDateTime.now())
                .build();
        colleges.add(collegeRepository.save(college3));

        return colleges;
    }

    private List<User> createCollegeAdmins(List<College> colleges, User superAdmin) {
        List<User> collegeAdmins = new ArrayList<>();

        for (int i = 0; i < colleges.size(); i++) {
            College college = colleges.get(i);
            User admin = User.builder()
                    .email("admin@" + college.getDomain())
                    .name(college.getName() + " Administrator")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .type(UserType.ADMIN)
                    .college(college)
                    .isActive(true)
                    .phoneNumber("+91-" + String.format("98765432%02d", i + 10))
                    .bio("College Administrator for " + college.getName())
                    .address(college.getAddress())
                    .city(college.getAddress().split(",")[1].trim())
                    .country("India")
                    .createdAt(LocalDateTime.now())
                    .lastLogin(LocalDateTime.now())
                    .createdBy(superAdmin)
                    .build();
            collegeAdmins.add(userRepository.save(admin));
        }

        return collegeAdmins;
    }

    private List<User> createFacultyMembers(List<College> colleges, List<User> collegeAdmins) {
        List<User> facultyMembers = new ArrayList<>();

        for (int i = 0; i < colleges.size(); i++) {
            College college = colleges.get(i);
            User admin = collegeAdmins.get(i);

            // Create 3 faculty members per college
            for (int j = 0; j < 3; j++) {
                User faculty = User.builder()
                        .email(String.format("faculty%d@%s", j + 1, college.getDomain()))
                        .name(String.format("Faculty Member %d - %s", j + 1, college.getCode()))
                        .passwordHash(passwordEncoder.encode("faculty123"))
                        .type(UserType.FACULTY)
                        .college(college)
                        .isActive(true)
                        .phoneNumber("+91-" + String.format("87654321%02d", (i * 3) + j + 10))
                        .bio(String.format("Subject Expert and Faculty at %s", college.getName()))
                        .address(college.getAddress())
                        .city(college.getAddress().split(",")[1].trim())
                        .country("India")
                        .dateOfBirth(LocalDate.of(1985 + j, (j % 12) + 1, (j % 28) + 1))
                        .createdAt(LocalDateTime.now())
                        .lastLogin(LocalDateTime.now())
                        .createdBy(admin)
                        .build();
                facultyMembers.add(userRepository.save(faculty));
            }
        }

        return facultyMembers;
    }

    private List<User> createStudents(List<College> colleges, List<User> collegeAdmins) {
        List<User> students = new ArrayList<>();

        for (int i = 0; i < colleges.size(); i++) {
            College college = colleges.get(i);
            User admin = collegeAdmins.get(i);

            // Create 10 students per college
            for (int j = 0; j < 10; j++) {
                User student = User.builder()
                        .email(String.format("student%d@%s", j + 1, college.getDomain()))
                        .name(String.format("Student %d - %s", j + 1, college.getCode()))
                        .passwordHash(passwordEncoder.encode("student123"))
                        .type(UserType.USER)
                        .college(college)
                        .isActive(true)
                        .phoneNumber("+91-" + String.format("76543210%02d", (i * 10) + j + 10))
                        .bio(String.format("Student at %s", college.getName()))
                        .address(college.getAddress())
                        .city(college.getAddress().split(",")[1].trim())
                        .country("India")
                        .dateOfBirth(LocalDate.of(2000 + (j % 5), ((j % 12) + 1), ((j % 28) + 1)))
                        .createdAt(LocalDateTime.now())
                        .lastLogin(LocalDateTime.now())
                        .createdBy(admin)
                        .build();
                students.add(userRepository.save(student));
            }
        }

        return students;
    }

    private void createSampleCoursesAndContent(List<College> colleges, List<User> facultyMembers) {
        // Create sample courses for each college
        for (int i = 0; i < colleges.size(); i++) {
            College college = colleges.get(i);
            
            // Get faculty members for this college
            List<User> collegeFaculty = facultyMembers.stream()
                    .filter(faculty -> faculty.getCollege().getId().equals(college.getId()))
                    .toList();

            createSampleCourse(college, collegeFaculty.get(0), "Java Programming", "JAVA101");
            createSampleCourse(college, collegeFaculty.get(1), "Database Management", "DB101");
            createSampleCourse(college, collegeFaculty.get(2), "Web Development", "WEB101");
        }
    }

    private void createSampleCourse(College college, User faculty, String courseName, String courseCode) {
        // This is a placeholder - implement based on your Course model structure
        System.out.println(String.format("Creating sample course: %s (%s) for %s by %s", 
            courseName, courseCode, college.getName(), faculty.getName()));
    }

    private void printLoginCredentials() {
        System.out.println("\n=== LOGIN CREDENTIALS FOR TESTING ===");
        System.out.println("Root Admin:");
        System.out.println("  Email: root@bkitsolutions.in");
        System.out.println("  Password: rootadmin123");
        
        System.out.println("\nSuper Admin:");
        System.out.println("  Email: superadmin@bkitsolutions.in");
        System.out.println("  Password: superadmin123");
        
        System.out.println("\nCollege Admins:");
        System.out.println("  BKIT: admin@bkit.edu.in / admin123");
        System.out.println("  DU: admin@du.edu.in / admin123");
        System.out.println("  TI: admin@techins.edu.in / admin123");
        
        System.out.println("\nFaculty (example):");
        System.out.println("  BKIT: faculty1@bkit.edu.in / faculty123");
        System.out.println("  DU: faculty1@du.edu.in / faculty123");
        System.out.println("  TI: faculty1@techins.edu.in / faculty123");
        
        System.out.println("\nStudents (example):");
        System.out.println("  BKIT: student1@bkit.edu.in / student123");
        System.out.println("  DU: student1@du.edu.in / student123");
        System.out.println("  TI: student1@techins.edu.in / student123");
        System.out.println("=====================================\n");
    }

    /**
     * Clear all data - Note: This should only be used for development/testing
     * In production, you might want more granular data management
     */  
    @Transactional
    public void clearAllData() {
        System.out.println("Clearing all data...");
        
        try {
            // Delete in order to respect foreign key constraints
            // Start with entities that have no dependencies
            
            // Clear all course/content related data first
            if (courseRepository != null) courseRepository.deleteAll();
            if (testRepository != null) testRepository.deleteAll(); 
            if (questionRepository != null) questionRepository.deleteAll();
            if (topicRepository != null) topicRepository.deleteAll();
            if (chapterRepository != null) chapterRepository.deleteAll();
            
            // Clear user data but leave college references intact for now
            // Find all users first
            List<User> allUsers = userRepository.findAll();
            
            // Delete users without college dependencies (ROOT and SUPER admins first)
            allUsers.stream()
                .filter(user -> user.getType() == UserType.ROOTADMIN || user.getType() == UserType.SUPERADMIN)
                .forEach(user -> {
                    // First remove this user as creator from all other users they created
                    List<User> createdUsers = userRepository.findAll().stream()
                        .filter(u -> u.getCreatedBy() != null && u.getCreatedBy().getId().equals(user.getId()))
                        .collect(java.util.stream.Collectors.toList());
                    
                    createdUsers.forEach(u -> u.setCreatedBy(null));
                    userRepository.saveAll(createdUsers);
                    
                    // Remove as college onboarder
                    List<College> onboardedColleges = collegeRepository.findByOnboardedById(user.getId());
                    collegeRepository.deleteAll(onboardedColleges);
                    
                    // Now delete the user
                    userRepository.delete(user);
                });
            
            // Clear remaining users (they should have no college constraints now)
            userRepository.deleteAll();
            collegeRepository.deleteAll();
            
            System.out.println("All data cleared successfully!");
            
        } catch (Exception e) {
            System.out.println("Error clearing data: " + e.getMessage());
            throw new RuntimeException("Failed to clear data", e);
        }
    }
}