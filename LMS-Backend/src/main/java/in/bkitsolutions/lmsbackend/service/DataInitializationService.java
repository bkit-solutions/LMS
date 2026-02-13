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
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void initializeAllData() {
        // Check if data already exists
        if (userRepository.existsByType(UserType.ROOTADMIN)) {
            System.out.println("Data already exists. Skipping initialization.");
            enrichTopic5IfNeeded();
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
        
        // Step 8: Enrich topic 5 with comprehensive content
        enrichTopic5IfNeeded();

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

            // Create 4 faculty members per college
            for (int j = 0; j < 4; j++) {
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
        for (int i = 0; i < colleges.size(); i++) {
            College college = colleges.get(i);
            List<User> collegeFaculty = facultyMembers.stream()
                    .filter(faculty -> faculty.getCollege().getId().equals(college.getId()))
                    .toList();

            // Faculty 1 → Java Programming course
            createJavaCourse(college, collegeFaculty.get(0));
            // Faculty 2 → Database Management course
            createDatabaseCourse(college, collegeFaculty.get(1));
            // Faculty 3 → Web Development course
            createWebDevCourse(college, collegeFaculty.get(2));
            // Faculty 4 → B-Pharm course
            if (collegeFaculty.size() > 3) {
                createBPharmCourse(college, collegeFaculty.get(3));
            }
            // Faculty 1 → Data Science Complete Course (demonstrating ALL content types)
            createDataScienceCompleteCourse(college, collegeFaculty.get(0));
        }
    }

    private void createJavaCourse(College college, User faculty) {
        // Create the course first
        Course javaCourse = Course.builder()
                .title("Java Programming Masterclass")
                .description("A comprehensive Java programming course covering fundamentals to advanced concepts. Learn OOP, collections, streams, exception handling, and build real-world projects.")
                .createdBy(faculty)
                .college(college)
                .published(true)
                .enrollmentOpen(true)
                .category("Programming")
                .difficultyLevel("BEGINNER")
                .estimatedHours(40)
                .displayOrder(1)
                .build();
        Course savedCourse = courseRepository.save(javaCourse);

        // Now create topics with course reference
        Topic fundamentals = createAndSaveTopic(savedCourse, faculty, "Java Fundamentals", 
            "Core Java programming concepts including variables, data types, control flow, and OOP.", 1);
        createAndSaveChapter(fundamentals, "Introduction to Java",
            "<h2>What is Java?</h2><p>Java is a high-level, class-based, object-oriented programming language designed to have as few implementation dependencies as possible. It was originally developed by James Gosling at Sun Microsystems and released in 1995.</p><h3>Key Features</h3><ul><li><strong>Platform Independent</strong> — Write Once, Run Anywhere (WORA)</li><li><strong>Object-Oriented</strong> — Everything is an object</li><li><strong>Strongly Typed</strong> — Type safety at compile time</li><li><strong>Automatic Memory Management</strong> — Garbage collection</li><li><strong>Multithreaded</strong> — Built-in support for concurrent programming</li></ul><h3>Setting Up Java</h3><p>Install JDK (Java Development Kit) from Oracle or use OpenJDK. Verify installation:</p><pre><code>java --version\njavac --version</code></pre><h3>Your First Program</h3><pre><code>public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}</code></pre>", 1);
        createAndSaveChapter(fundamentals, "Variables & Data Types",
            "<h2>Variables in Java</h2><p>A variable is a container that holds a value. In Java, every variable must have a declared type.</p><h3>Primitive Data Types</h3><table><tr><th>Type</th><th>Size</th><th>Range</th><th>Example</th></tr><tr><td>byte</td><td>1 byte</td><td>-128 to 127</td><td><code>byte b = 100;</code></td></tr><tr><td>short</td><td>2 bytes</td><td>-32,768 to 32,767</td><td><code>short s = 1000;</code></td></tr><tr><td>int</td><td>4 bytes</td><td>-2^31 to 2^31-1</td><td><code>int i = 42;</code></td></tr><tr><td>long</td><td>8 bytes</td><td>-2^63 to 2^63-1</td><td><code>long l = 100000L;</code></td></tr><tr><td>float</td><td>4 bytes</td><td>IEEE 754</td><td><code>float f = 3.14f;</code></td></tr><tr><td>double</td><td>8 bytes</td><td>IEEE 754</td><td><code>double d = 3.14159;</code></td></tr><tr><td>char</td><td>2 bytes</td><td>Unicode</td><td><code>char c = 'A';</code></td></tr><tr><td>boolean</td><td>1 bit</td><td>true/false</td><td><code>boolean b = true;</code></td></tr></table><h3>Reference Types</h3><pre><code>String name = \"Alice\";\nint[] numbers = {1, 2, 3, 4, 5};\nArrayList&lt;String&gt; list = new ArrayList&lt;&gt;();</code></pre>", 2);
        createAndSaveChapter(fundamentals, "Control Flow & Loops",
            "<h2>Conditional Statements</h2><h3>if-else</h3><pre><code>int score = 85;\nif (score >= 90) {\n    System.out.println(\"Grade: A\");\n} else if (score >= 80) {\n    System.out.println(\"Grade: B\");\n} else if (score >= 70) {\n    System.out.println(\"Grade: C\");\n} else {\n    System.out.println(\"Grade: F\");\n}</code></pre><h3>switch</h3><pre><code>String day = \"Monday\";\nswitch (day) {\n    case \"Monday\" -> System.out.println(\"Start of week\");\n    case \"Friday\" -> System.out.println(\"TGIF!\");\n    default -> System.out.println(\"Regular day\");\n}</code></pre><h2>Loops</h2><h3>for loop</h3><pre><code>for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}</code></pre><h3>while loop</h3><pre><code>int count = 0;\nwhile (count < 5) {\n    System.out.println(count);\n    count++;\n}</code></pre><h3>for-each loop</h3><pre><code>String[] fruits = {\"apple\", \"banana\", \"cherry\"};\nfor (String fruit : fruits) {\n    System.out.println(fruit);\n}</code></pre>", 3);
        createAndSaveChapter(fundamentals, "Object-Oriented Programming",
            "<h2>OOP Concepts</h2><p>Java is built around four fundamental OOP principles.</p><h3>1. Encapsulation</h3><p>Bundling data and methods that operate on the data within a single unit (class):</p><pre><code>public class Student {\n    private String name;\n    private int age;\n\n    public String getName() { return name; }\n    public void setName(String name) { this.name = name; }\n    public int getAge() { return age; }\n    public void setAge(int age) { this.age = age; }\n}</code></pre><h3>2. Inheritance</h3><p>Creating new classes based on existing ones:</p><pre><code>public class Animal {\n    public void eat() { System.out.println(\"Eating...\"); }\n}\n\npublic class Dog extends Animal {\n    public void bark() { System.out.println(\"Woof!\"); }\n}</code></pre><h3>3. Polymorphism</h3><p>Objects taking many forms:</p><pre><code>public interface Shape {\n    double area();\n}\n\npublic class Circle implements Shape {\n    private double radius;\n    public double area() { return Math.PI * radius * radius; }\n}\n\npublic class Rectangle implements Shape {\n    private double w, h;\n    public double area() { return w * h; }\n}</code></pre><h3>4. Abstraction</h3><p>Hiding complex implementation details and showing only necessary features.</p>", 4);

        Topic advanced = createAndSaveTopic(savedCourse, faculty, "Advanced Java",
            "Advanced Java concepts including collections, streams, exception handling, and file I/O.", 2);
        createAndSaveChapter(advanced, "Collections Framework",
            "<h2>Java Collections</h2><p>The Collections Framework provides a unified architecture for representing and manipulating collections of objects.</p><h3>List</h3><pre><code>List&lt;String&gt; names = new ArrayList&lt;&gt;();\nnames.add(\"Alice\");\nnames.add(\"Bob\");\nnames.get(0); // \"Alice\"\nnames.size(); // 2</code></pre><h3>Set</h3><pre><code>Set&lt;String&gt; unique = new HashSet&lt;&gt;();\nunique.add(\"apple\");\nunique.add(\"apple\"); // ignored\nunique.size(); // 1</code></pre><h3>Map</h3><pre><code>Map&lt;String, Integer&gt; scores = new HashMap&lt;&gt;();\nscores.put(\"Alice\", 95);\nscores.put(\"Bob\", 87);\nscores.get(\"Alice\"); // 95\nscores.containsKey(\"Bob\"); // true</code></pre><h3>Iteration</h3><pre><code>for (Map.Entry&lt;String, Integer&gt; entry : scores.entrySet()) {\n    System.out.println(entry.getKey() + \": \" + entry.getValue());\n}</code></pre>", 1);
        
        // VIDEO CHAPTER EXAMPLE - YouTube video
        createAndSaveChapter(advanced, "Java Streams Tutorial - Video",
            "<h2>Watch: Complete Guide to Java Streams</h2><p>This video covers lambda expressions, functional programming, and the powerful Streams API with practical examples.</p><h3>Topics Covered:</h3><ul><li>Lambda syntax and functional interfaces</li><li>Stream operations: filter, map, reduce</li><li>Collectors and grouping</li><li>Parallel streams for performance</li></ul>",
            ContentType.VIDEO,
            "https://www.youtube.com/watch?v=t1-YZ6bF-g0", // Java Streams example video
            "YOUTUBE",
            null, null, null, null,
            45, true, 2);
        
        createAndSaveChapter(advanced, "Exception Handling",
            "<h2>Exceptions in Java</h2><p>Exception handling is a mechanism to handle runtime errors gracefully.</p><h3>try-catch-finally</h3><pre><code>try {\n    int result = 10 / 0;\n} catch (ArithmeticException e) {\n    System.out.println(\"Cannot divide by zero: \" + e.getMessage());\n} finally {\n    System.out.println(\"This always executes\");\n}</code></pre><h3>Custom Exceptions</h3><pre><code>public class InsufficientFundsException extends Exception {\n    private double amount;\n    \n    public InsufficientFundsException(double amount) {\n        super(\"Insufficient funds: \" + amount);\n        this.amount = amount;\n    }\n    \n    public double getAmount() { return amount; }\n}</code></pre><h3>try-with-resources</h3><pre><code>try (BufferedReader reader = new BufferedReader(new FileReader(\"file.txt\"))) {\n    String line;\n    while ((line = reader.readLine()) != null) {\n        System.out.println(line);\n    }\n} catch (IOException e) {\n    e.printStackTrace();\n}</code></pre>", 3);

        // DOCUMENT CHAPTER EXAMPLE - PDF reference
        createAndSaveChapter(advanced, "Java Best Practices - Quick Reference",
            "<h2>Java Coding Standards & Best Practices</h2><p>Download the comprehensive PDF guide covering:</p><ul><li>Naming conventions (variables, classes, methods)</li><li>Code organization and package structure</li><li>Error handling patterns</li><li>Performance optimization tips</li><li>Security best practices</li><li>Testing strategies (JUnit, Mockito)</li></ul><p><strong>This document is essential for writing clean, maintainable Java code.</strong></p>",
            ContentType.DOCUMENT,
            null, null,
            "https://www.oracle.com/java/technologies/javase/codeconventions-contents.html",
            "Java_Best_Practices_Guide.pdf",
            "PDF",
            null,
            20, false, 4);

        Topic practical = createAndSaveTopic(savedCourse, faculty, "Practical Java Projects",
            "Build real-world applications and consolidate your Java knowledge through hands-on projects.", 3);
        
        // MIXED CONTENT - Text + Video + Document
        createAndSaveChapter(practical, "Building a REST API - Complete Guide",
            "<h2>Project: Building a RESTful API with Java</h2><p>In this comprehensive module, you'll build a complete REST API from scratch.</p><h3>📹 Video Tutorial</h3><p>Watch the step-by-step implementation video below.</p><h3>📄 Project Resources</h3><p>Download the starter code, database schema, and Postman collection from the attached documents.</p><h3>What You'll Build</h3><ul><li>User authentication with JWT</li><li>CRUD operations for resources</li><li>Database integration with JPA</li><li>API documentation with Swagger</li><li>Error handling and validation</li><li>Unit and integration tests</li></ul><h3>Prerequisites</h3><pre><code>// Dependencies needed\nSpring Boot 3.x\nSpring Data JPA\nMySQL/PostgreSQL\nLombok\nSpring Security\nJWT Library</code></pre>",
            ContentType.MIXED,
            "https://www.youtube.com/watch?v=9SGDpanrc8U", // Spring Boot REST API tutorial
            "YOUTUBE",
            "https://github.com/spring-projects/spring-boot/blob/main/README.md",
            "REST_API_Project_Resources.zip",
            "ZIP",
            null,
            90, true, 1);
        
        createAndSaveChapter(practical, "Console-Based Banking Application",
            "<h2>Project: Banking System</h2><p>Build a console-based banking application demonstrating OOP principles.</p><h3>Features to Implement</h3><ul><li>Account creation and management</li><li>Deposit and withdrawal operations</li><li>Transaction history</li><li>Different account types (Savings, Current)</li><li>Interest calculation</li><li>Data persistence with file I/O</li></ul><h3>Concepts Applied</h3><ul><li>Inheritance (Account hierarchy)</li><li>Polymorphism (different account behaviors)</li><li>Encapsulation (protecting account data)</li><li>Exception handling (invalid transactions)</li><li>Collections (managing multiple accounts)</li><li>File I/O (saving/loading data)</li></ul><h3>Starter Code</h3><pre><code>public abstract class Account {\n    protected String accountNumber;\n    protected String holderName;\n    protected double balance;\n    \n    public abstract void calculateInterest();\n    \n    public void deposit(double amount) {\n        if (amount <= 0) {\n            throw new IllegalArgumentException(\"Amount must be positive\");\n        }\n        balance += amount;\n    }\n    \n    public void withdraw(double amount) throws InsufficientFundsException {\n        if (amount > balance) {\n            throw new InsufficientFundsException(balance - amount);\n        }\n        balance -= amount;\n    }\n}</code></pre>",
            ContentType.TEXT,
            null, null, null, null, null, null,
            60, true, 2);

        // VIDEO CHAPTER - Deployment tutorial
        createAndSaveChapter(practical, "Deploying Java Applications - Video Tutorial",
            "<h2>Deployment Strategies</h2><p>Learn how to deploy your Java applications to production environments.</p><h3>Covered Topics:</h3><ul><li>Building executable JARs with Maven/Gradle</li><li>Deploying to cloud platforms (AWS, Heroku, Azure)</li><li>Containerization with Docker</li><li>CI/CD pipelines with Jenkins/GitHub Actions</li><li>Environment configuration and secrets management</li><li>Monitoring and logging in production</li></ul>",
            ContentType.VIDEO,
            "https://www.youtube.com/watch?v=p6xDcz00i1g", // Docker + Spring Boot deployment
            "YOUTUBE",
            null, null, null, null,
            50, false, 3);

        System.out.println("  ✅ Created Java Programming course for " + college.getName() + " (with varied content types)");
    }

    private void createDatabaseCourse(College college, User faculty) {
        // Create the course first
        Course dbCourse = Course.builder()
                .title("Database Management Systems")
                .description("Master database design, SQL queries, normalization, and learn to build efficient data-driven applications.")
                .createdBy(faculty)
                .college(college)
                .published(true)
                .enrollmentOpen(true)
                .category("Database")
                .difficultyLevel("INTERMEDIATE")
                .estimatedHours(30)
                .displayOrder(2)
                .build();
        Course savedCourse = courseRepository.save(dbCourse);

        // Now create topics with course reference
        Topic sqlBasics = createAndSaveTopic(savedCourse, faculty, "SQL Fundamentals",
            "Master SQL queries from basic SELECT statements to complex joins and subqueries.", 1);
        createAndSaveChapter(sqlBasics, "Introduction to Databases",
            "<h2>What is a Database?</h2><p>A database is an organized collection of structured data stored electronically. Relational databases store data in tables with rows and columns.</p><h3>Key Concepts</h3><ul><li><strong>Table</strong> — A collection of related data entries (rows and columns)</li><li><strong>Row (Record)</strong> — A single entry in a table</li><li><strong>Column (Field)</strong> — A specific attribute of data</li><li><strong>Primary Key</strong> — Unique identifier for each row</li><li><strong>Foreign Key</strong> — Reference to a primary key in another table</li></ul><h3>Popular RDBMS</h3><ul><li>MySQL — Open source, widely used</li><li>PostgreSQL — Advanced, feature-rich</li><li>Oracle — Enterprise-grade</li><li>SQL Server — Microsoft's offering</li><li>SQLite — Lightweight, embedded</li></ul>", 1);
        createAndSaveChapter(sqlBasics, "SELECT Queries",
            "<h2>Retrieving Data with SELECT</h2><h3>Basic Syntax</h3><pre><code>SELECT column1, column2 FROM table_name;\nSELECT * FROM students;</code></pre><h3>Filtering with WHERE</h3><pre><code>SELECT * FROM students WHERE age > 18;\nSELECT * FROM products WHERE price BETWEEN 10 AND 50;\nSELECT * FROM users WHERE name LIKE 'A%';\nSELECT * FROM orders WHERE status IN ('pending', 'processing');</code></pre><h3>Sorting & Limiting</h3><pre><code>SELECT * FROM students ORDER BY name ASC;\nSELECT * FROM products ORDER BY price DESC LIMIT 10;\nSELECT * FROM employees ORDER BY salary DESC LIMIT 5 OFFSET 10;</code></pre><h3>Aggregate Functions</h3><pre><code>SELECT COUNT(*) FROM students;\nSELECT AVG(salary) FROM employees;\nSELECT department, COUNT(*) as cnt\nFROM employees\nGROUP BY department\nHAVING cnt > 5;</code></pre>", 2);
        createAndSaveChapter(sqlBasics, "Joins & Relationships",
            "<h2>SQL Joins</h2><p>Joins combine rows from two or more tables based on related columns.</p><h3>INNER JOIN</h3><pre><code>SELECT s.name, c.title\nFROM students s\nINNER JOIN enrollments e ON s.id = e.student_id\nINNER JOIN courses c ON e.course_id = c.id;</code></pre><h3>LEFT JOIN</h3><pre><code>SELECT s.name, COUNT(e.id) as courses_enrolled\nFROM students s\nLEFT JOIN enrollments e ON s.id = e.student_id\nGROUP BY s.id;</code></pre><h3>Types of Joins</h3><ul><li><strong>INNER JOIN</strong> — Only matching rows from both tables</li><li><strong>LEFT JOIN</strong> — All rows from left + matching from right</li><li><strong>RIGHT JOIN</strong> — All rows from right + matching from left</li><li><strong>FULL OUTER JOIN</strong> — All rows from both tables</li><li><strong>CROSS JOIN</strong> — Cartesian product of both tables</li></ul>", 3);

        Topic dbDesign = createAndSaveTopic(savedCourse, faculty, "Database Design & Normalization",
            "Learn how to design efficient and scalable database schemas using normalization principles.", 2);
        createAndSaveChapter(dbDesign, "ER Diagrams & Schema Design",
            "<h2>Entity-Relationship Diagrams</h2><p>ER diagrams visually represent the structure of a database by showing entities, attributes, and relationships.</p><h3>Components</h3><ul><li><strong>Entity</strong> — A real-world object (rectangle)</li><li><strong>Attribute</strong> — Property of an entity (oval)</li><li><strong>Relationship</strong> — Association between entities (diamond)</li></ul><h3>Cardinality</h3><ul><li><strong>One-to-One (1:1)</strong> — User ↔ Profile</li><li><strong>One-to-Many (1:N)</strong> — Teacher → Courses</li><li><strong>Many-to-Many (M:N)</strong> — Students ↔ Courses (via junction table)</li></ul><h3>Design Best Practices</h3><ul><li>Use meaningful table and column names</li><li>Define primary keys for every table</li><li>Use proper data types and constraints</li><li>Add indexes on frequently queried columns</li><li>Document your schema design decisions</li></ul>", 1);
        createAndSaveChapter(dbDesign, "Normalization",
            "<h2>Database Normalization</h2><p>Normalization is the process of organizing data to minimize redundancy and improve data integrity.</p><h3>Normal Forms</h3><h4>1NF — First Normal Form</h4><ul><li>Eliminate repeating groups</li><li>Each cell contains a single value</li><li>Each row is unique (primary key)</li></ul><h4>2NF — Second Normal Form</h4><ul><li>Must be in 1NF</li><li>All non-key columns must depend on the entire primary key</li><li>Remove partial dependencies</li></ul><h4>3NF — Third Normal Form</h4><ul><li>Must be in 2NF</li><li>Remove transitive dependencies</li><li>Non-key columns depend only on the primary key</li></ul><h3>Denormalization</h3><p>Sometimes, for performance reasons, we intentionally add redundancy (denormalize). Common in read-heavy applications, caching, and reporting systems.</p>", 2);
        
        // VIDEO CHAPTER - PostgreSQL tutorial
        createAndSaveChapter(dbDesign, "Advanced SQL Techniques - Video Masterclass",
            "<h2>Master Advanced SQL</h2><p>Watch this comprehensive video covering window functions, CTEs, and query optimization.</p><h3>What You'll Learn:</h3><ul><li>Common Table Expressions (CTEs)</li><li>Window functions (ROW_NUMBER, RANK, PARTITION BY)</li><li>Recursive queries</li><li>Query execution plans and optimization</li><li>Index strategies for performance</li></ul>",
            ContentType.VIDEO,
            "https://www.youtube.com/watch?v=qw--VYLpxG4", // PostgreSQL tutorial
            "YOUTUBE",
            null, null, null, null,
            75, false, 3);

        Topic dbAdmin = createAndSaveTopic(savedCourse, faculty, "Database Administration & Performance",
            "Learn database administration, backup strategies, and performance tuning techniques.", 3);
        
        // DOCUMENT CHAPTER - Database administration guide
        createAndSaveChapter(dbAdmin, "MySQL Performance Tuning Guide",
            "<h2>Database Performance Optimization</h2><p>Download the complete MySQL performance tuning guide covering:</p><ul><li>Server configuration and optimization</li><li>Query optimization techniques</li><li>Index design and usage</li><li>Partitioning strategies</li><li>Replication and high availability</li><li>Monitoring and profiling tools</li></ul><p><strong>Essential reading for database administrators and backend developers.</strong></p>",
            ContentType.DOCUMENT,
            null, null,
            "https://dev.mysql.com/doc/refman/8.0/en/optimization.html",
            "MySQL_Performance_Tuning_Guide.pdf",
            "PDF",
            null,
            30, false, 1);
        
        createAndSaveChapter(dbAdmin, "Backup and Recovery Strategies",
            "<h2>Database Backup & Recovery</h2><p>Essential techniques for protecting your data and ensuring business continuity.</p><h3>Backup Types</h3><ul><li><strong>Full Backup</strong> — Complete database copy</li><li><strong>Incremental Backup</strong> — Only changes since last backup</li><li><strong>Differential Backup</strong> — Changes since last full backup</li></ul><h3>MySQL Backup Tools</h3><pre><code># Using mysqldump\nmysqldump -u root -p database_name > backup.sql\n\n# Restore from backup\nmysql -u root -p database_name < backup.sql\n\n# Binary log backup\nmysqlbinlog binlog.000001 > backup.sql</code></pre><h3>Best Practices</h3><ul><li>Automate backups with cron jobs</li><li>Store backups in multiple locations</li><li>Test restore procedures regularly</li><li>Monitor backup success/failure</li><li>Implement point-in-time recovery</li><li>Document recovery procedures</li></ul>", 2);

        System.out.println("  ✅ Created Database Management course for " + college.getName() + " (with varied content types)");
    }

    private void createWebDevCourse(College college, User faculty) {
        // Create the course first
        Course webCourse = Course.builder()
                .title("Full-Stack Web Development")
                .description("Learn to build complete web applications from frontend to backend. Covers HTML5, CSS3, JavaScript, React, and Spring Boot.")
                .createdBy(faculty)
                .college(college)
                .published(true)
                .enrollmentOpen(true)
                .category("Web Development")
                .difficultyLevel("INTERMEDIATE")
                .estimatedHours(60)
                .displayOrder(3)
                .build();
        Course savedCourse = courseRepository.save(webCourse);

        // Now create topics with course reference
        Topic frontend = createAndSaveTopic(savedCourse, faculty, "Frontend Development",
            "Build modern, responsive web interfaces with HTML, CSS, and JavaScript.", 1);
        createAndSaveChapter(frontend, "Modern HTML5",
            "<h2>HTML5 — The Foundation of the Web</h2><p>HTML5 is the latest evolution of HTML, introducing semantic elements, multimedia support, and better accessibility.</p><h3>Semantic Elements</h3><pre><code>&lt;header&gt;Site Header&lt;/header&gt;\n&lt;nav&gt;Navigation Menu&lt;/nav&gt;\n&lt;main&gt;\n  &lt;article&gt;\n    &lt;section&gt;Content Section&lt;/section&gt;\n  &lt;/article&gt;\n  &lt;aside&gt;Sidebar&lt;/aside&gt;\n&lt;/main&gt;\n&lt;footer&gt;Site Footer&lt;/footer&gt;</code></pre><h3>Forms</h3><pre><code>&lt;form&gt;\n  &lt;input type=\"text\" placeholder=\"Name\" required&gt;\n  &lt;input type=\"email\" placeholder=\"Email\" required&gt;\n  &lt;input type=\"date\"&gt;\n  &lt;input type=\"range\" min=\"0\" max=\"100\"&gt;\n  &lt;select&gt;\n    &lt;option&gt;Option 1&lt;/option&gt;\n    &lt;option&gt;Option 2&lt;/option&gt;\n  &lt;/select&gt;\n  &lt;button type=\"submit\"&gt;Submit&lt;/button&gt;\n&lt;/form&gt;</code></pre><h3>Multimedia</h3><pre><code>&lt;audio controls src=\"song.mp3\"&gt;&lt;/audio&gt;\n&lt;video controls width=\"640\"&gt;\n  &lt;source src=\"video.mp4\" type=\"video/mp4\"&gt;\n&lt;/video&gt;\n&lt;canvas id=\"myCanvas\" width=\"400\" height=\"300\"&gt;&lt;/canvas&gt;</code></pre>", 1);
        createAndSaveChapter(frontend, "CSS3 & Responsive Design",
            "<h2>Modern CSS3</h2><h3>Flexbox Layout</h3><pre><code>.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 16px;\n}\n\n.item {\n  flex: 1 1 300px;\n}</code></pre><h3>CSS Grid</h3><pre><code>.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 20px;\n}</code></pre><h3>Responsive Design</h3><pre><code>/* Mobile First */\n.card {\n  padding: 16px;\n  font-size: 14px;\n}\n\n/* Tablet */\n@media (min-width: 768px) {\n  .card {\n    padding: 24px;\n    font-size: 16px;\n  }\n}\n\n/* Desktop */\n@media (min-width: 1024px) {\n  .card {\n    padding: 32px;\n    font-size: 18px;\n  }\n}</code></pre><h3>CSS Variables & Animations</h3><pre><code>:root {\n  --primary: #3b82f6;\n  --transition: 0.3s ease;\n}\n\n.button {\n  background: var(--primary);\n  transition: transform var(--transition);\n}\n\n.button:hover {\n  transform: scale(1.05);\n}</code></pre>", 2);
        createAndSaveChapter(frontend, "JavaScript ES6+",
            "<h2>Modern JavaScript</h2><h3>Destructuring</h3><pre><code>const { name, age } = person;\nconst [first, second, ...rest] = array;</code></pre><h3>Arrow Functions</h3><pre><code>const add = (a, b) => a + b;\nconst greet = name => `Hello, ${name}!`;</code></pre><h3>Promises & Async/Await</h3><pre><code>// Promise\nfetch('/api/data')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));\n\n// Async/Await\nasync function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error(error);\n  }\n}</code></pre><h3>Modules</h3><pre><code>// Export\nexport const PI = 3.14159;\nexport function calculate(r) { return PI * r * r; }\nexport default class Calculator { }\n\n// Import\nimport Calculator, { PI, calculate } from './math.js';</code></pre>", 3);

        Topic backend = createAndSaveTopic(savedCourse, faculty, "Backend Development with Spring Boot",
            "Build RESTful APIs and server-side applications using Spring Boot and Java.", 2);
        createAndSaveChapter(backend, "Spring Boot Basics",
            "<h2>Getting Started with Spring Boot</h2><p>Spring Boot makes it easy to create production-grade Spring-based applications with minimal configuration.</p><h3>Project Setup</h3><p>Use <strong>Spring Initializr</strong> (start.spring.io) to generate a project with dependencies:</p><ul><li>Spring Web — RESTful APIs</li><li>Spring Data JPA — Database access</li><li>MySQL Driver — Database connectivity</li><li>Lombok — Reduce boilerplate code</li><li>Spring Security — Authentication & authorization</li></ul><h3>Project Structure</h3><pre><code>src/main/java/com/example/\n├── Application.java          // Main entry point\n├── controller/               // REST controllers\n├── service/                  // Business logic\n├── repository/               // Data access\n├── model/                    // Entity classes\n├── dto/                      // Data transfer objects\n├── config/                   // Configuration\n└── security/                 // Security config</code></pre><h3>Your First Controller</h3><pre><code>@RestController\n@RequestMapping(\"/api\")\npublic class HelloController {\n    @GetMapping(\"/hello\")\n    public String hello() {\n        return \"Hello, Spring Boot!\";\n    }\n}</code></pre>", 1);
        createAndSaveChapter(backend, "RESTful API Design",
            "<h2>Building REST APIs</h2><h3>REST Principles</h3><ul><li>Use HTTP methods: GET, POST, PUT, PATCH, DELETE</li><li>Resource-based URLs</li><li>Stateless communication</li><li>JSON for request/response bodies</li></ul><h3>CRUD Controller</h3><p>Basic REST controller with CRUD operations.</p>", 2);
        createAndSaveChapter(backend, "JPA & Database Integration",
            "<h2>Spring Data JPA</h2><p>Spring Data JPA simplifies database operations by providing repository abstractions over JPA.</p><h3>Entity Definition</h3><p>Use JPA annotations to map Java objects to database tables.</p><h3>Repository Pattern</h3><p>Create repository interfaces that extend JpaRepository for CRUD operations.</p>", 3);

        System.out.println("  ✅ Created Web Development course for " + college.getName());
    }

    private void createBPharmCourse(College college, User faculty) {
        // Create the course first
        Course bpharmCourse = Course.builder()
                .title("Bachelor of Pharmacy — Fundamentals")
                .description("Comprehensive introduction to pharmaceutical sciences covering pharmacology, drug chemistry, drug design, and analytical techniques. Essential foundation for pharmacy students.")
                .createdBy(faculty)
                .college(college)
                .published(true)
                .enrollmentOpen(true)
                .category("Pharmaceutical Sciences")
                .difficultyLevel("INTERMEDIATE")
                .estimatedHours(80)
                .prerequisites("Basic knowledge of chemistry, biology, and human anatomy")
                .learningObjectives("Understand drug action mechanisms, pharmacokinetics and pharmacodynamics principles, drug design and structure-activity relationships, pharmaceutical quality control and analysis techniques")
                .tags("pharmacy, pharmacology, drug design, pharma chemistry, healthcare, medical sciences")
                .displayOrder(4)
                .build();
        Course savedCourse = courseRepository.save(bpharmCourse);

        // Now create topics with course reference
        Topic pharmacology = createAndSaveTopic(savedCourse, faculty, "Pharmacology Fundamentals",
            "Introduction to drug action, pharmacokinetics, pharmacodynamics, and therapeutic applications.", 1);
        createAndSaveChapter(pharmacology, "Introduction to Pharmacology",
            "<h2>What is Pharmacology?</h2><p>Pharmacology is the branch of medicine and pharmaceutical sciences concerned with the study of drug action, where a drug can be broadly defined as any chemical substance that affects biological systems.</p><h3>Branches of Pharmacology</h3><ul><li><strong>Pharmacokinetics</strong> — What the body does to drugs (ADME: Absorption, Distribution, Metabolism, Excretion)</li><li><strong>Pharmacodynamics</strong> — What drugs do to the body (mechanisms of action, dose-response relationships)</li><li><strong>Pharmacotherapeutics</strong> — Clinical use of drugs in disease treatment</li><li><strong>Toxicology</strong> — Study of adverse effects of drugs and chemicals</li><li><strong>Clinical Pharmacology</strong> — Application of pharmacological principles in medical practice</li></ul><h3>Drug Classification</h3><table><tr><th>Class</th><th>Examples</th><th>Use</th></tr><tr><td>Antibiotics</td><td>Amoxicillin, Ciprofloxacin</td><td>Bacterial infections</td></tr><tr><td>Analgesics</td><td>Paracetamol, Ibuprofen</td><td>Pain relief</td></tr><tr><td>Antihypertensives</td><td>Amlodipine, Enalapril</td><td>High blood pressure</td></tr><tr><td>Antihistamines</td><td>Cetirizine, Loratadine</td><td>Allergic reactions</td></tr><tr><td>Antidiabetics</td><td>Metformin, Insulin</td><td>Diabetes mellitus</td></tr></table><h3>Routes of Drug Administration</h3><ul><li><strong>Oral (PO)</strong> — Tablets, capsules, syrups</li><li><strong>Intravenous (IV)</strong> — Direct injection into bloodstream</li><li><strong>Intramuscular (IM)</strong> — Injection into muscle tissue</li><li><strong>Subcutaneous (SC)</strong> — Injection under the skin</li><li><strong>Topical</strong> — Applied to skin or mucous membranes</li><li><strong>Inhalation</strong> — Respiratory route for drugs</li></ul>", 1);
        createAndSaveChapter(pharmacology, "Pharmacokinetics — Drug Movement",
            "<h2>ADME Principles</h2><h3>1. Absorption</h3><p>The process by which a drug enters the bloodstream from its site of administration.</p><ul><li><strong>First-pass metabolism</strong> — Drugs absorbed from GI tract pass through liver before reaching systemic circulation</li><li><strong>Bioavailability (F)</strong> — Fraction of administered dose that reaches systemic circulation unchanged</li></ul><pre><code>IV injection: F = 100%\nOral route: F typically < 100% due to incomplete absorption and first-pass</code></pre><h3>2. Distribution</h3><p>Movement of drug from bloodstream to tissues and organs.</p><ul><li><strong>Volume of Distribution (Vd)</strong> — Apparent volume in which drug is distributed</li><li><strong>Protein Binding</strong> — Drugs bind to plasma proteins (albumin, α1-acid glycoprotein)</li><li><strong>Blood-Brain Barrier</strong> — Selective permeability restricts drug entry to CNS</li></ul><h3>3. Metabolism (Biotransformation)</h3><p>Chemical modification of drugs, primarily in the liver by cytochrome P450 enzymes.</p><ul><li><strong>Phase I reactions</strong> — Oxidation, reduction, hydrolysis (add/expose functional groups)</li><li><strong>Phase II reactions</strong> — Conjugation (glucuronidation, sulfation) to increase water solubility</li></ul><h3>4. Excretion</h3><p>Elimination of drugs and metabolites from the body.</p><ul><li><strong>Renal excretion</strong> — Primary route (glomerular filtration, tubular secretion/reabsorption)</li><li><strong>Biliary excretion</strong> — Via bile into feces</li><li><strong>Other routes</strong> — Lungs (volatile substances), sweat, saliva, breast milk</li></ul><h3>Half-life (t½)</h3><p>Time required for drug concentration to decrease by 50%</p><pre><code>Steady state achieved in 4-5 half-lives\nDosing interval typically = 1 half-life for sustained effect</code></pre>", 2);
        createAndSaveChapter(pharmacology, "Pharmacodynamics — Drug Action",
            "<h2>Mechanisms of Drug Action</h2><h3>Drug-Receptor Interactions</h3><p>Most drugs produce effects by binding to specific molecular targets (receptors, enzymes, ion channels, transporters).</p><ul><li><strong>Agonist</strong> — Binds and activates receptor (mimics endogenous ligand)</li><li><strong>Antagonist</strong> — Binds receptor without activation, blocks agonist effects</li><li><strong>Partial Agonist</strong> — Produces submaximal response even at full receptor occupancy</li><li><strong>Inverse Agonist</strong> — Binds receptor and produces opposite effect to agonist</li></ul><h3>Dose-Response Relationship</h3><pre><code>Response ∝ Dose (within therapeutic range)\n\nKey Parameters:\n• ED₅₀ — Effective dose in 50% of population\n• TD₅₀ — Toxic dose in 50% of population\n• LD₅₀ — Lethal dose in 50% of population (animal studies)\n• Therapeutic Index (TI) = TD₅₀ / ED₅₀\n  Higher TI = Safer drug</code></pre><h3>Receptor Types</h3><table><tr><th>Receptor</th><th>Mechanism</th><th>Examples</th></tr><tr><td>G-Protein Coupled</td><td>Second messenger systems</td><td>β-adrenergic, muscarinic</td></tr><tr><td>Ligand-gated Ion Channels</td><td>Direct channel opening</td><td>GABA-A, nicotinic</td></tr><tr><td>Enzyme-linked</td><td>Intrinsic enzyme activity</td><td>Insulin receptor</td></tr><tr><td>Nuclear</td><td>Gene transcription</td><td>Steroid receptors</td></tr></table><h3>Drug Selectivity & Specificity</h3><ul><li><strong>Selectivity</strong> — Degree to which drug affects one target vs. others</li><li><strong>Specificity</strong> — Ability to produce only one effect</li><li>Side effects often due to non-selective binding</li></ul>", 3);
        createAndSaveChapter(pharmacology, "Drug Interactions & Adverse Effects",
            "<h2>Drug-Drug Interactions</h2><h3>Pharmacokinetic Interactions</h3><ul><li><strong>Absorption</strong> — Chelation (tetracyclines + antacids), altered gastric pH</li><li><strong>Distribution</strong> — Displacement from protein binding sites</li><li><strong>Metabolism</strong> — Enzyme induction (rifampicin) or inhibition (ketoconazole)</li><li><strong>Excretion</strong> — Competition for renal tubular secretion</li></ul><pre><code>Example: Warfarin (anticoagulant)\n• Enzyme inducers (rifampicin) → ↓ warfarin levels → ↓ anticoagulation\n• Enzyme inhibitors (azoles) → ↑ warfarin levels → ↑ bleeding risk</code></pre><h3>Pharmacodynamic Interactions</h3><ul><li><strong>Synergism</strong> — Combined effect > sum of individual effects (e.g., alcohol + benzodiazepines)</li><li><strong>Antagonism</strong> — Drugs oppose each other's effects (e.g., insulin + corticosteroids)</li><li><strong>Potentiation</strong> — One drug enhances effect of another</li></ul><h2>Adverse Drug Reactions (ADRs)</h2><h3>Type A (Augmented)</h3><p>Dose-dependent, predictable from pharmacology</p><ul><li>Examples: Hypoglycemia with insulin, bleeding with warfarin</li></ul><h3>Type B (Bizarre)</h3><p>Not dose-dependent, unpredictable, often immune-mediated</p><ul><li>Examples: Penicillin allergy, malignant hyperthermia with anesthetics</li></ul><h3>Type C (Chronic)</h3><p>Associated with long-term use</p><ul><li>Examples: Osteoporosis with corticosteroids, nephrotoxicity with NSAIDs</li></ul><h3>Type D (Delayed)</h3><p>Occur after prolonged latency</p><ul><li>Examples: Teratogenicity, carcinogenicity</li></ul><h2>Pharmacovigilance</h2><p>Science and activities relating to detection, assessment, understanding, and prevention of adverse effects or any other drug-related problems. Healthcare professionals must report suspected ADRs to regulatory authorities.</p>", 4);

        Topic pharmaChemistry = createAndSaveTopic(savedCourse, faculty, "Pharmaceutical Chemistry",
            "Study of drug design, synthesis, analysis, and structure-activity relationships of pharmaceutical compounds.", 2);
        createAndSaveChapter(pharmaChemistry, "Drug Design & Development",
            "<h2>Drug Discovery Process</h2><h3>Stages of Drug Development</h3><ol><li><strong>Target Identification</strong> — Identify biological target (protein, enzyme, receptor)</li><li><strong>Lead Discovery</strong> — Find molecules that interact with target (HTS, structure-based design)</li><li><strong>Lead Optimization</strong> — Improve potency, selectivity, ADME properties</li><li><strong>Preclinical Testing</strong> — In vitro and animal studies (safety, efficacy)</li><li><strong>Clinical Trials</strong><ul><li>Phase I — Safety in healthy volunteers (20-100 subjects)</li><li>Phase II — Efficacy in patients (100-300 subjects)</li><li>Phase III — Large-scale efficacy (1000-3000 subjects)</li><li>Phase IV — Post-marketing surveillance</li></ul></li><li><strong>Regulatory Approval</strong> — Submit New Drug Application (NDA) to FDA/regulatory authority</li><li><strong>Manufacturing & Marketing</strong></li></ol><h3>Structure-Activity Relationship (SAR)</h3><p>Relationship between chemical structure and biological activity. Small structural changes can dramatically affect:</p><ul><li>Potency (strength of effect)</li><li>Selectivity (target specificity)</li><li>Duration of action</li><li>Toxicity profile</li></ul><h3>Key Functional Groups</h3><table><tr><th>Group</th><th>Property</th><th>Example</th></tr><tr><td>-OH (hydroxyl)</td><td>Hydrogen bonding, water solubility</td><td>Alcohols, phenols</td></tr><tr><td>-COOH (carboxyl)</td><td>Acidic, ionizable</td><td>NSAIDs (aspirin)</td></tr><tr><td>-NH₂ (amine)</td><td>Basic, ionizable</td><td>Local anesthetics</td></tr><tr><td>-C=O (carbonyl)</td><td>Hydrogen bond acceptor</td><td>Ketones, aldehydes</td></tr><tr><td>Aromatic rings</td><td>π-π interactions, lipophilicity</td><td>Many drugs</td></tr></table><h3>Lipinski's Rule of Five</h3><p>Predicts oral bioavailability:</p><pre><code>1. Molecular weight ≤ 500 Da\n2. LogP (lipophilicity) ≤ 5\n3. H-bond donors ≤ 5 (NH, OH groups)\n4. H-bond acceptors ≤ 10 (N, O atoms)\n\nViolation of >1 rule → likely poor oral absorption</code></pre>", 1);
        createAndSaveChapter(pharmaChemistry, "Major Drug Classes — Chemistry",
            "<h2>1. Antibiotics</h2><h3>β-Lactams (Penicillins, Cephalosporins)</h3><pre><code>Core Structure: Four-membered β-lactam ring\nMechanism: Inhibit bacterial cell wall synthesis (transpeptidase inhibition)\n\nExamples:\n• Amoxicillin — Broad-spectrum penicillin\n• Ceftriaxone — Third-generation cephalosporin</code></pre><h3>Fluoroquinolones</h3><pre><code>Core: Quinolone ring with fluorine substitution\nMechanism: Inhibit DNA gyrase and topoisomerase IV\n\nExamples:\n• Ciprofloxacin\n• Levofloxacin</code></pre><h2>2. NSAIDs (Non-Steroidal Anti-Inflammatory Drugs)</h2><pre><code>Mechanism: Inhibit cyclooxygenase (COX-1 and COX-2)\n→ Reduce prostaglandin synthesis\n→ Anti-inflammatory, analgesic, antipyretic effects\n\nClassification:\n• Non-selective COX inhibitors: Ibuprofen, Aspirin, Diclofenac\n• Selective COX-2 inhibitors: Celecoxib (reduced GI side effects)</code></pre><h2>3. Cardiovascular Drugs</h2><h3>ACE Inhibitors (Angiotensin-Converting Enzyme)</h3><pre><code>Structure: Contain carboxyl group to bind Zn²⁺ in ACE active site\nMechanism: Block conversion of angiotensin I → angiotensin II\n→ Vasodilation, reduced blood pressure\n\nExamples: Enalapril, Lisinopril, Ramipril\nSide effect: Dry cough (due to bradykinin accumulation)</code></pre><h3>Calcium Channel Blockers</h3><pre><code>Types:\n• Dihydropyridines (Amlodipine, Nifedipine) — Vascular selective\n• Non-dihydropyridines (Verapamil, Diltiazem) — Cardiac selective\n\nMechanism: Block L-type Ca²⁺ channels\n→ Vasodilation, reduced cardiac contractility</code></pre><h2>4. Central Nervous System Drugs</h2><h3>Benzodiazepines</h3><pre><code>Core: Fused benzene + diazepine rings\nMechanism: Positive allosteric modulators of GABA-A receptors\n→ Anxiolytic, sedative, muscle relaxant, anticonvulsant\n\nExamples:\n• Diazepam (Valium)\n• Alprazolam (Xanax)\n• Lorazepam (Ativan)</code></pre>", 2);
        createAndSaveChapter(pharmaChemistry, "Analytical Techniques",
            "<h2>Quality Control in Pharmaceuticals</h2><h3>Spectroscopic Methods</h3><h4>1. UV-Visible Spectroscopy</h4><ul><li>Measures absorption of UV/visible light</li><li>Applications: Quantitative analysis, drug identification</li><li>Principle: Beer-Lambert Law — A = εcl</li></ul><h4>2. Infrared (IR) Spectroscopy</h4><ul><li>Identifies functional groups based on vibrational frequencies</li><li>Fingerprint region (400-1500 cm⁻¹) unique to each compound</li></ul><h4>3. Nuclear Magnetic Resonance (NMR)</h4><ul><li>¹H-NMR and ¹³C-NMR for structure elucidation</li><li>Provides information about molecular connectivity and environment</li></ul><h3>Chromatographic Methods</h3><h4>High-Performance Liquid Chromatography (HPLC)</h4><pre><code>Principle: Separation based on differential partitioning between\nmobile phase (liquid) and stationary phase (solid)\n\nApplications:\n• Drug purity analysis\n• Impurity profiling\n• Stability studies\n• Dissolution testing</code></pre><h4>Gas Chromatography (GC)</h4><ul><li>For volatile compounds</li><li>Often coupled with Mass Spectrometry (GC-MS)</li></ul><h4>Thin Layer Chromatography (TLC)</h4><ul><li>Simple, rapid, cost-effective</li><li>Qualitative identification and purity checks</li></ul><h3>Pharmacopeial Standards</h3><ul><li><strong>USP</strong> (United States Pharmacopeia) — US standards</li><li><strong>BP</strong> (British Pharmacopoeia) — UK standards</li><li><strong>IP</strong> (Indian Pharmacopoeia) — Indian standards</li><li><strong>EP</strong> (European Pharmacopoeia) — European standards</li></ul><p>These define quality specifications for identity, purity, strength, and quality of pharmaceuticals.</p>", 3);

        System.out.println("  ✅ Created B-Pharm course for " + college.getName());
    }

    private Topic createAndSaveTopic(Course course, User faculty, String title, String description, int order) {
        Topic topic = Topic.builder()
                .title(title)
                .description(description)
                .course(course)
                .createdBy(faculty)
                .published(true)
                .displayOrder(order)
                .build();
        return topicRepository.save(topic);
    }

    private Chapter createAndSaveChapter(Topic topic, String title, String content, int order) {
        Chapter chapter = Chapter.builder()
                .title(title)
                .content(content)
                .contentType(ContentType.TEXT)
                .topic(topic)
                .displayOrder(order)
                .isMandatory(true)
                .estimatedMinutes(15)
                .build();
        return chapterRepository.save(chapter);
    }

    // Overloaded method for chapters with different content types
    private Chapter createAndSaveChapter(Topic topic, String title, String content, ContentType contentType,
                                         String videoUrl, String videoPlatform, String documentUrl, 
                                         String documentName, String documentType, Long testId,
                                         Integer estimatedMinutes, Boolean isMandatory, int order) {
        Chapter chapter = Chapter.builder()
                .title(title)
                .content(content)
                .contentType(contentType)
                .videoUrl(videoUrl)
                .videoPlatform(videoPlatform)
                .documentUrl(documentUrl)
                .documentName(documentName)
                .documentType(documentType)
                .testId(testId)
                .estimatedMinutes(estimatedMinutes)
                .isMandatory(isMandatory)
                .topic(topic)
                .displayOrder(order)
                .build();
        return chapterRepository.save(chapter);
    }

    /**
     * Create a comprehensive Data Science course demonstrating ALL content types
     * This course showcases TEXT, VIDEO, DOCUMENT, and MIXED content formats
     */
    private void createDataScienceCompleteCourse(College college, User faculty) {
        // Create the course
        Course dsCourse = Course.builder()
                .title("Complete Data Science & Analytics Bootcamp")
                .description("Master data science from Python fundamentals to machine learning deployment. This comprehensive course includes hands-on projects, video tutorials, downloadable resources, and real-world case studies.")
                .createdBy(faculty)
                .college(college)
                .published(true)
                .enrollmentOpen(true)
                .category("Data Science")
                .difficultyLevel("BEGINNER")
                .estimatedHours(50)
                .displayOrder(5)
                .build();
        Course savedCourse = courseRepository.save(dsCourse);

        // ========== TOPIC 1: Python for Data Science (TEXT + VIDEO) ==========
        Topic pythonTopic = createAndSaveTopic(savedCourse, faculty, "Python Fundamentals",
            "Learn Python programming essentials including syntax, data structures, and libraries crucial for data science.", 1);
        
        // TEXT chapter
        createAndSaveChapter(pythonTopic, "Python Basics & Setup",
            "<h2>Setting Up Your Environment</h2><p>Before diving into data science, we need to set up a proper Python environment.</p><h3>Option 1: Anaconda (Recommended)</h3><p>Anaconda includes Python and 250+ popular data science packages.</p><pre><code># Download from: https://www.anaconda.com/download\n# Verify installation:\nconda --version\npython --version</code></pre><h3>Option 2: Python + pip</h3><pre><code># Install Python from python.org\n# Install packages:\npip install numpy pandas matplotlib seaborn scikit-learn jupyter</code></pre><h3>Jupyter Notebook</h3><p>Interactive environment for data analysis and visualization.</p><pre><code># Launch Jupyter:\njupyter notebook\n\n# Or use JupyterLab:\njupyter lab</code></pre><h3>Python Basics Refresher</h3><pre><code># Variables and types\nname = \"Alice\"\nage = 25\nsalary = 75000.50\nis_employed = True\n\n# Lists\nnumbers = [1, 2, 3, 4, 5]\nnames = ['Alice', 'Bob', 'Charlie']\n\n# Dictionaries\nperson = {\n    'name': 'Alice',\n    'age': 25,\n    'skills': ['Python', 'SQL', 'ML']\n}\n\n# Functions\ndef calculate_average(numbers):\n    return sum(numbers) / len(numbers)\n\n# List comprehension\nsquares = [x**2 for x in range(10)]\neven_numbers = [x for x in range(20) if x % 2 == 0]</code></pre><h3>Essential Libraries</h3><ul><li><strong>NumPy</strong> — Numerical computing, arrays, linear algebra</li><li><strong>Pandas</strong> — Data manipulation and analysis</li><li><strong>Matplotlib/Seaborn</strong> — Data visualization</li><li><strong>Scikit-learn</strong> — Machine learning algorithms</li><li><strong>Jupyter</strong> — Interactive notebooks</li></ul>",
            ContentType.TEXT, null, null, null, null, null, null, 20, true, 1);
        
        // VIDEO chapter
        createAndSaveChapter(pythonTopic, "Python Crash Course - Video Tutorial",
            "<h2>📹 Python Complete Crash Course</h2><p>Watch this comprehensive video tutorial covering everything you need to know about Python for data science.</p><h3>What You'll Learn:</h3><ul><li>Python syntax and fundamentals</li><li>Data structures (lists, tuples, dictionaries, sets)</li><li>Functions and lambda expressions</li><li>File handling and exceptions</li><li>Object-oriented programming basics</li><li>Working with modules and packages</li></ul><p><strong>⏱️ Duration: 4 hours | Perfect for beginners!</strong></p>",
            ContentType.VIDEO,
            "https://www.youtube.com/watch?v=rfscVS0vtbw",
            "YOUTUBE",
            null, null, null, null,
            240, true, 2);
        
        // TEXT chapter with code
        createAndSaveChapter(pythonTopic, "NumPy & Pandas Essentials",
            "<h2>NumPy — Arrays & Numerical Computing</h2><pre><code>import numpy as np\n\n# Creating arrays\narr = np.array([1, 2, 3, 4, 5])\nmatrix = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])\nzeros = np.zeros((3, 4))  # 3x4 matrix of zeros\nones = np.ones((2, 3))    # 2x3 matrix of ones\nrandom = np.random.rand(3, 3)  # Random 3x3 matrix\n\n# Array operations\nprint(arr * 2)           # Element-wise multiplication\nprint(arr + 10)          # Broadcasting\nprint(np.mean(arr))      # Average\nprint(np.std(arr))       # Standard deviation\nprint(arr.sum())         # Sum\nprint(arr.max())         # Maximum\n\n# Matrix operations\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\nprint(A + B)             # Element-wise addition\nprint(A * B)             # Element-wise multiplication\nprint(A.dot(B))          # Matrix multiplication\nprint(A @ B)             # Alternative matrix mult\nprint(A.T)               # Transpose\n\n# Indexing and slicing\narr = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])\nprint(arr[5])            # Element at index 5\nprint(arr[2:7])          # Elements from 2 to 6\nprint(arr[::2])          # Every other element\nprint(arr[arr > 5])      # Boolean indexing</code></pre><h2>Pandas — Data Manipulation</h2><pre><code>import pandas as pd\n\n# Creating DataFrames\ndf = pd.DataFrame({\n    'Name': ['Alice', 'Bob', 'Charlie', 'David'],\n    'Age': [25, 30, 35, 28],\n    'Salary': [70000, 80000, 90000, 75000],\n    'Department': ['IT', 'HR', 'IT', 'Finance']\n})\n\n# Basic operations\nprint(df.head())          # First 5 rows\nprint(df.tail(3))         # Last 3 rows\nprint(df.shape)           # (rows, columns)\nprint(df.columns)         # Column names\nprint(df.info())          # Data types and non-null counts\nprint(df.describe())      # Statistical summary\n\n# Selecting data\nprint(df['Name'])         # Single column (Series)\nprint(df[['Name', 'Age']]) # Multiple columns (DataFrame)\nprint(df.iloc[0])         # First row by position\nprint(df.loc[0])          # First row by label\nprint(df[df['Age'] > 28]) # Filtering rows\n\n# Data manipulation\ndf['Bonus'] = df['Salary'] * 0.1  # New column\ndf['Years'] = 2026 - (2026 - df['Age'])  # Derived column\ndf_sorted = df.sort_values('Salary', ascending=False)\ndf_grouped = df.groupby('Department')['Salary'].mean()\n\n# Reading/Writing files\ndf.to_csv('data.csv', index=False)\ndf = pd.read_csv('data.csv')\ndf.to_excel('data.xlsx', index=False)\ndf = pd.read_excel('data.xlsx')</code></pre>",
            ContentType.TEXT, null, null, null, null, null, null, 25, true, 3);

        // ========== TOPIC 2: Data Analysis & Visualization (TEXT + DOCUMENT) ==========
        Topic analysisTopicviz = createAndSaveTopic(savedCourse, faculty, "Data Analysis & Visualization",
            "Master exploratory data analysis (EDA) techniques and create compelling visualizations with Matplotlib and Seaborn.", 2);
        
        // TEXT chapter
        createAndSaveChapter(analysisTopicviz, "Exploratory Data Analysis (EDA)",
            "<h2>Understanding Your Data</h2><p>EDA is the critical first step in any data science project. It helps you understand patterns, spot anomalies, test hypotheses, and check assumptions.</p><h3>Step 1: Load and Inspect</h3><pre><code>import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('data.csv')\n\n# Basic inspection\nprint(df.shape)           # Dimensions\nprint(df.head(10))        # First 10 rows\nprint(df.info())          # Data types and missing values\nprint(df.describe())      # Statistical summary\nprint(df.columns.tolist()) # Column names</code></pre><h3>Step 2: Check for Missing Values</h3><pre><code># Missing value analysis\nmissing = df.isnull().sum()\nmissing_pct = (df.isnull().sum() / len(df)) * 100\nmissing_df = pd.DataFrame({\n    'Missing Count': missing,\n    'Percentage': missing_pct\n})\nprint(missing_df[missing_df['Missing Count'] > 0])</code></pre><h3>Step 3: Data Distributions</h3><pre><code># Numerical columns\ndf.describe().T\n\n# Categorical columns\nfor col in df.select_dtypes(include='object').columns:\n    print(f'\\n{col}:')\n    print(df[col].value_counts())\n    print(f'Unique values: {df[col].nunique()}')</code></pre><h3>Step 4: Correlations</h3><pre><code># Correlation matrix\ncorr_matrix = df.corr()\nprint(corr_matrix)\n\n# Find highly correlated features\nhigh_corr = []\nfor i in range(len(corr_matrix.columns)):\n    for j in range(i+1, len(corr_matrix.columns)):\n        if abs(corr_matrix.iloc[i, j]) > 0.7:\n            high_corr.append((\n                corr_matrix.columns[i],\n                corr_matrix.columns[j],\n                corr_matrix.iloc[i, j]\n            ))\nprint(high_corr)</code></pre><h3>Step 5: Outlier Detection</h3><pre><code># Using IQR method\ndef detect_outliers(df, column):\n    Q1 = df[column].quantile(0.25)\n    Q3 = df[column].quantile(0.75)\n    IQR = Q3 - Q1\n    lower_bound = Q1 - 1.5 * IQR\n    upper_bound = Q3 + 1.5 * IQR\n    outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]\n    return outliers\n\n# Check each numeric column\nfor col in df.select_dtypes(include=np.number).columns:\n    outliers = detect_outliers(df, col)\n    print(f'{col}: {len(outliers)} outliers')</code></pre>",
            ContentType.TEXT, null, null, null, null, null, null, 30, true, 1);
        
        // DOCUMENT chapter
        createAndSaveChapter(analysisTopicviz, "Data Visualization Cheat Sheet",
            "<h2>📄 Complete Visualization Guide</h2><p>Download the comprehensive data visualization cheat sheet covering:</p><ul><li><strong>Matplotlib Basics</strong> — Figure, axes, subplots, styling</li><li><strong>Chart Types</strong> — Line, bar, scatter, histogram, box plot, violin plot</li><li><strong>Seaborn Advanced</strong> — FacetGrid, PairGrid, heatmaps, categorical plots</li><li><strong>Best Practices</strong> — Color palettes, annotations, legends, titles</li><li><strong>Interactive Visualizations</strong> — Plotly, Bokeh basics</li><li><strong>Real-world Examples</strong> — Business dashboards, scientific plots</li></ul><p><strong>Essential reference for creating publication-ready visualizations!</strong></p>",
            ContentType.DOCUMENT,
            null, null,
            "https://matplotlib.org/stable/tutorials/index.html",
            "Data_Visualization_Complete_Guide.pdf",
            "PDF",
            null,
            20, false, 2);
        
        // TEXT chapter with visualization code
        createAndSaveChapter(analysisTopicviz, "Creating Professional Visualizations",
            "<h2>Matplotlib & Seaborn</h2><h3>Basic Plots with Matplotlib</h3><pre><code>import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Line plot\nplt.figure(figsize=(10, 6))\nplt.plot(x, y, marker='o', linestyle='-', color='blue', label='Sales')\nplt.title('Monthly Sales Trend', fontsize=16)\nplt.xlabel('Month', fontsize=12)\nplt.ylabel('Revenue ($)', fontsize=12)\nplt.legend()\nplt.grid(True, alpha=0.3)\nplt.tight_layout()\nplt.show()\n\n# Bar plot\ncategories = ['Product A', 'Product B', 'Product C', 'Product D']\nvalues = [45, 67, 89, 52]\nplt.figure(figsize=(10, 6))\nplt.bar(categories, values, color='steelblue')\nplt.title('Product Sales Comparison')\nplt.ylabel('Units Sold')\nplt.xticks(rotation=45)\nplt.tight_layout()\nplt.show()\n\n# Scatter plot\nplt.figure(figsize=(10, 6))\nplt.scatter(df['Age'], df['Salary'], alpha=0.6, c='coral')\nplt.title('Age vs Salary')\nplt.xlabel('Age')\nplt.ylabel('Salary')\nplt.tight_layout()\nplt.show()</code></pre><h3>Advanced Visualizations with Seaborn</h3><pre><code>import seaborn as sns\nsns.set_style('whitegrid')\n\n# Distribution plot\nfig, axes = plt.subplots(1, 2, figsize=(15, 5))\nsns.histplot(df['Salary'], kde=True, ax=axes[0])\naxes[0].set_title('Salary Distribution')\nsns.boxplot(y='Salary', x='Department', data=df, ax=axes[1])\naxes[1].set_title('Salary by Department')\nplt.tight_layout()\nplt.show()\n\n# Correlation heatmap\nplt.figure(figsize=(12, 8))\nsns.heatmap(df.corr(), annot=True, cmap='coolwarm', center=0,\n            square=True, linewidths=1)\nplt.title('Feature Correlation Matrix')\nplt.tight_layout()\nplt.show()\n\n# Pair plot\nsns.pairplot(df, hue='Department', diag_kind='kde')\nplt.suptitle('Feature Relationships', y=1.02)\nplt.show()\n\n# Categorical plot\nfig, axes = plt.subplots(2, 2, figsize=(15, 12))\nsns.countplot(data=df, x='Department', ax=axes[0, 0])\nsns.violinplot(data=df, x='Department', y='Salary', ax=axes[0, 1])\nsns.swarmplot(data=df, x='Department', y='Age', ax=axes[1, 0])\nsns.barplot(data=df, x='Department', y='Salary', estimator=np.mean, ax=axes[1, 1])\nplt.tight_layout()\nplt.show()</code></pre>",
            ContentType.TEXT, null, null, null, null, null, null, 25, true, 3);

        // ========== TOPIC 3: Machine Learning Basics (VIDEO + TEXT) ==========
        Topic mlTopic = createAndSaveTopic(savedCourse, faculty, "Machine Learning Fundamentals",
            "Introduction to supervised and unsupervised learning with practical implementations using scikit-learn.", 3);
        
        // VIDEO chapter
        createAndSaveChapter(mlTopic, "Machine Learning Introduction - Video Course",
            "<h2>🎥 Complete ML Fundamentals</h2><p>Comprehensive video course covering machine learning from scratch.</p><h3>Course Contents:</h3><ul><li><strong>Module 1: Introduction</strong><ul><li>What is Machine Learning?</li><li>Types of ML (Supervised, Unsupervised, Reinforcement)</li><li>Real-world applications</li></ul></li><li><strong>Module 2: Regression</strong><ul><li>Linear Regression</li><li>Polynomial Regression</li><li>Regularization (Ridge, Lasso)</li></ul></li><li><strong>Module 3: Classification</strong><ul><li>Logistic Regression</li><li>Decision Trees</li><li>Random Forests</li><li>SVM</li></ul></li><li><strong>Module 4: Clustering</strong><ul><li>K-Means</li><li>Hierarchical Clustering</li><li>DBSCAN</li></ul></li><li><strong>Module 5: Evaluation</strong><ul><li>Train-test split</li><li>Cross-validation</li><li>Metrics (Accuracy, Precision, Recall, F1)</li></ul></li></ul><p><strong>⏱️ Duration: 8 hours | Includes code examples and projects</strong></p>",
            ContentType.VIDEO,
            "https://www.youtube.com/watch?v=7eh4d6sabA0",
            "YOUTUBE",
            null, null, null, null,
            480, true, 1);
        
        // TEXT chapter
        createAndSaveChapter(mlTopic, "Supervised Learning with Scikit-learn",
            "<h2>Building Your First ML Model</h2><h3>Step 1: Import Libraries</h3><pre><code>import pandas as pd\nimport numpy as np\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score, classification_report, confusion_matrix</code></pre><h3>Step 2: Load and Prepare Data</h3><pre><code># Load data\ndf = pd.read_csv('data.csv')\n\n# Separate features and target\nX = df.drop('target', axis=1)\ny = df['target']\n\n# Split data (80% train, 20% test)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y\n)\n\nprint(f'Training set: {X_train.shape}')\nprint(f'Test set: {X_test.shape}')</code></pre><h3>Step 3: Feature Scaling</h3><pre><code># Standardize features (mean=0, std=1)\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.transform(X_test)</code></pre><h3>Step 4: Train Model</h3><pre><code># Create and train model\nmodel = LogisticRegression(random_state=42, max_iter=1000)\nmodel.fit(X_train_scaled, y_train)\n\nprint('Model trained successfully!')</code></pre><h3>Step 5: Make Predictions</h3><pre><code># Predict on test set\ny_pred = model.predict(X_test_scaled)\n\n# Get prediction probabilities\ny_pred_proba = model.predict_proba(X_test_scaled)\n\nprint('Predictions:', y_pred[:10])</code></pre><h3>Step 6: Evaluate Model</h3><pre><code># Accuracy\naccuracy = accuracy_score(y_test, y_pred)\nprint(f'Accuracy: {accuracy:.2%}')\n\n# Confusion Matrix\ncm = confusion_matrix(y_test, y_pred)\nprint('\\nConfusion Matrix:')\nprint(cm)\n\n# Classification Report\nprint('\\nClassification Report:')\nprint(classification_report(y_test, y_pred))</code></pre><h3>Complete Pipeline</h3><pre><code>from sklearn.pipeline import Pipeline\nfrom sklearn.ensemble import RandomForestClassifier\n\n# Create pipeline\npipeline = Pipeline([\n    ('scaler', StandardScaler()),\n    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))\n])\n\n# Train\npipeline.fit(X_train, y_train)\n\n# Predict\ny_pred = pipeline.predict(X_test)\n\n# Evaluate\naccuracy = accuracy_score(y_test, y_pred)\nprint(f'Pipeline Accuracy: {accuracy:.2%}')</code></pre>",
            ContentType.TEXT, null, null, null, null, null, null, 35, true, 2);

        // ========== TOPIC 4: Real-World Project (MIXED) ==========
        Topic projectTopic = createAndSaveTopic(savedCourse, faculty, "Capstone Project: Customer Churn Prediction",
            "Complete end-to-end data science project from data collection to model deployment.", 4);
        
        // MIXED chapter - combines all content types
        createAndSaveChapter(projectTopic, "Complete Project Walkthrough",
            "<h2>🚀 Real-World Data Science Project</h2><p>Build a complete customer churn prediction system from scratch!</p><h3>📹 Video Tutorial Series</h3><p>Follow along with our comprehensive video series covering every step of the project:</p><ol><li><strong>Part 1: Problem Definition & Data Collection</strong> (45 min)</li><li><strong>Part 2: EDA & Data Cleaning</strong> (60 min)</li><li><strong>Part 3: Feature Engineering</strong> (50 min)</li><li><strong>Part 4: Model Training & Evaluation</strong> (70 min)</li><li><strong>Part 5: Model Deployment with Flask</strong> (55 min)</li></ol><h3>📦 Download Project Resources</h3><p>Get the complete project starter pack including:</p><ul><li><strong>Dataset</strong> — Telecom customer churn data (10,000 records)</li><li><strong>Jupyter Notebooks</strong> — Step-by-step templates for each phase</li><li><strong>Python Scripts</strong> — Data preprocessing, training, evaluation</li><li><strong>Flask App Code</strong> — Web interface for predictions</li><li><strong>Deployment Guide</strong> — Docker, Heroku, AWS deployment steps</li><li><strong>Documentation</strong> — Project report template</li></ul><h3>🎯 Project Objectives</h3><ol><li>Analyze customer behavior patterns</li><li>Identify key churn indicators</li><li>Build predictive model (85%+ accuracy)</li><li>Create REST API for predictions</li><li>Deploy model to production</li><li>Set up monitoring and logging</li></ol><h3>🛠️ Tech Stack</h3><pre><code># Data Analysis\npandas, numpy, matplotlib, seaborn\n\n# Machine Learning\nscikit-learn, xgboost, lightgbm\n\n# Web Framework\nflask / fastapi\n\n# Deployment\ndocker, gunicorn\n\n# Monitoring\nprometheus, grafana</code></pre><h3>📊 Expected Outcomes</h3><ul><li>Complete Jupyter notebook with analysis</li><li>Trained model with 85%+ accuracy</li><li>Web application for predictions</li><li>API documentation</li><li>Deployment on cloud platform</li><li>Project presentation/report</li></ul><h3>🏆 Evaluation Criteria</h3><table><tr><th>Component</th><th>Weight</th></tr><tr><td>Data Analysis Quality</td><td>20%</td></tr><tr><td>Feature Engineering</td><td>15%</td></tr><tr><td>Model Performance</td><td>25%</td></tr><tr><td>Code Quality</td><td>15%</td></tr><tr><td>Documentation</td><td>10%</td></tr><tr><td>Deployment</td><td>15%</td></tr></table>",
            ContentType.MIXED,
            "https://www.youtube.com/watch?v=xl0N7tHiwlw",
            "YOUTUBE",
            "https://github.com/microsoft/ML-For-Beginners",
            "Customer_Churn_Project_Starter_Pack.zip",
            "ZIP",
            null,
            300, true, 1);
        
        // Additional DOCUMENT chapter for project
        createAndSaveChapter(projectTopic, "Machine Learning Best Practices Guide",
            "<h2>📚 Production ML Best Practices</h2><p>Comprehensive guide for building production-ready machine learning systems.</p><h3>Topics Covered:</h3><ul><li><strong>Data Management</strong><ul><li>Version control for datasets</li><li>Data validation and monitoring</li><li>Handling data drift</li></ul></li><li><strong>Model Development</strong><ul><li>Experiment tracking (MLflow, Weights & Biases)</li><li>Hyperparameter optimization</li><li>Model versioning</li></ul></li><li><strong>Deployment Strategies</strong><ul><li>Batch vs real-time predictions</li><li>A/B testing frameworks</li><li>Canary deployments</li><li>Blue-green deployments</li></ul></li><li><strong>Monitoring & Maintenance</strong><ul><li>Performance monitoring</li><li>Model retraining pipelines</li><li>Alerting systems</li><li>Logging best practices</li></ul></li><li><strong>MLOps</strong><ul><li>CI/CD for ML</li><li>Infrastructure as code</li><li>Containerization</li><li>Kubernetes for ML</li></ul></li></ul><p><strong>Essential reading for ML engineers and data scientists!</strong></p>",
            ContentType.DOCUMENT,
            null, null,
            "https://ml-ops.org/content/references",
            "ML_Production_Best_Practices.pdf",
            "PDF",
            null,
            45, false, 2);

        System.out.println("  ✅ Created Complete Data Science course for " + college.getName() + " (ALL content types: TEXT, VIDEO, DOCUMENT, MIXED)");
    }

    /**
     * Enrich Topic 5 with comprehensive Machine Learning content
     * This demonstrates all content types: TEXT, VIDEO, DOCUMENT, MIXED
     */
    @Transactional
    public void enrichTopic5IfNeeded() {
        // Check if topic 5 exists
        var topic5Opt = topicRepository.findById(5L);
        if (topic5Opt.isEmpty()) {
            System.out.println("Topic 5 not found. Skipping enrichment.");
            return;
        }
        
        Topic topic5 = topic5Opt.get();
        
        // Check if already enriched (more than 2 chapters means already done)
        long chapterCount = chapterRepository.countByTopicId(5L);
        if (chapterCount > 2) {
            System.out.println("Topic 5 already enriched with " + chapterCount + " chapters. Skipping.");
            return;
        }
        
        System.out.println("Enriching Topic 5 with Machine Learning content...");
        
        // Clear existing minimal chapters
        List<Chapter> existingChapters = chapterRepository.findByTopicIdOrderByDisplayOrderAsc(5L);
        chapterRepository.deleteAll(existingChapters);
        
        // Update topic with proper title and description
        topic5.setTitle("Machine Learning Fundamentals");
        topic5.setDescription("Comprehensive introduction to Machine Learning algorithms, applications, and hands-on projects using Python.");
        topicRepository.save(topic5);
        
        // Add comprehensive chapters with varied content types
        
        // Chapter 1: TEXT - Introduction
        createAndSaveChapter(topic5, "Introduction to Machine Learning",
            "<h2>What is Machine Learning?</h2><p>Machine Learning (ML) is a subset of Artificial Intelligence that enables systems to learn and improve from experience without being explicitly programmed.</p><h3>Types of Machine Learning</h3><ul><li><strong>Supervised Learning</strong> — Learn from labeled data (Classification, Regression)<ul><li>Examples: Email spam detection, house price prediction</li><li>Algorithms: Linear Regression, Logistic Regression, Decision Trees, Random Forest, SVM, Neural Networks</li></ul></li><li><strong>Unsupervised Learning</strong> — Find patterns in unlabeled data (Clustering, Dimensionality Reduction)<ul><li>Examples: Customer segmentation, anomaly detection</li><li>Algorithms: K-Means, DBSCAN, PCA, t-SNE</li></ul></li><li><strong>Reinforcement Learning</strong> — Learn through trial and error with rewards/penalties<ul><li>Examples: Game playing (AlphaGo), robotics, autonomous vehicles</li><li>Concepts: Agent, Environment, State, Action, Reward</li></ul></li></ul><h3>Key Concepts</h3><table><tr><th>Term</th><th>Definition</th></tr><tr><td>Features</td><td>Input variables used for prediction (X)</td></tr><tr><td>Target/Label</td><td>Output variable to predict (y)</td></tr><tr><td>Training Set</td><td>Data used to train the model</td></tr><tr><td>Test Set</td><td>Data used to evaluate model performance</td></tr><tr><td>Overfitting</td><td>Model performs well on training but poorly on new data</td></tr><tr><td>Underfitting</td><td>Model is too simple to capture data patterns</td></tr></table><h3>ML Workflow</h3><ol><li>Problem Definition — What are we trying to predict?</li><li>Data Collection — Gather relevant datasets</li><li>Data Preprocessing — Clean, transform, normalize data</li><li>Feature Engineering — Select/create meaningful features</li><li>Train-Test Split — Divide data for training and evaluation</li><li>Model Selection — Choose appropriate algorithm</li><li>Training — Fit model to training data</li><li>Evaluation — Measure performance on test set</li><li>Hyperparameter Tuning — Optimize model parameters</li><li>Deployment — Put model into production</li></ol>",
            ContentType.TEXT, null, null, null, null, null, null, 20, true, 1);
        
        // Chapter 2: TEXT - Python for ML
        createAndSaveChapter(topic5, "Python Libraries for Machine Learning",
            "<h2>Essential Python Libraries</h2><h3>1. NumPy — Numerical Computing</h3><pre><code>import numpy as np\n\n# Arrays\narr = np.array([1, 2, 3, 4, 5])\nmatrix = np.array([[1, 2], [3, 4], [5, 6]])\n\n# Operations\nprint(arr * 2)  # Element-wise multiplication\nprint(np.mean(arr))  # Average\nprint(np.dot(matrix.T, matrix))  # Matrix multiplication</code></pre><h3>2. Pandas — Data Manipulation</h3><pre><code>import pandas as pd\n\n# DataFrames\ndf = pd.read_csv('data.csv')\nprint(df.head())  # First 5 rows\nprint(df.describe())  # Statistical summary\nprint(df['column'].value_counts())  # Count unique values\n\n# Data cleaning\ndf.dropna(inplace=True)  # Remove missing values\ndf['new_col'] = df['col1'] * df['col2']  # Feature engineering</code></pre><h3>3. Matplotlib & Seaborn — Visualization</h3><pre><code>import matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Line plot\nplt.plot(x, y)\nplt.title('Line Plot')\nplt.show()\n\n# Scatter plot\nsns.scatterplot(data=df, x='feature1', y='feature2', hue='target')\nplt.show()\n\n# Heatmap (correlation matrix)\nsns.heatmap(df.corr(), annot=True, cmap='coolwarm')\nplt.show()</code></pre><h3>4. Scikit-learn — Machine Learning</h3><pre><code>from sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error, r2_score\n\n# Split data\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# Train model\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n\n# Predict\ny_pred = model.predict(X_test)\n\n# Evaluate\nprint('MSE:', mean_squared_error(y_test, y_pred))\nprint('R² Score:', r2_score(y_test, y_pred))</code></pre><h3>5. TensorFlow/Keras — Deep Learning</h3><pre><code>import tensorflow as tf\nfrom tensorflow import keras\n\n# Build neural network\nmodel = keras.Sequential([\n    keras.layers.Dense(128, activation='relu', input_shape=(input_dim,)),\n    keras.layers.Dropout(0.2),\n    keras.layers.Dense(64, activation='relu'),\n    keras.layers.Dense(num_classes, activation='softmax')\n])\n\n# Compile\nmodel.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])\n\n# Train\nmodel.fit(X_train, y_train, epochs=10, validation_split=0.2)</code></pre>",
            ContentType.TEXT, null, null, null, null, null, null, 25, true, 2);
        
        // Chapter 3: VIDEO - Complete ML Course
        createAndSaveChapter(topic5, "Machine Learning Full Course - Video Tutorial",
            "<h2>📹 Complete Machine Learning Course</h2><p>Watch this comprehensive 12-hour video course covering all fundamental ML algorithms with Python implementations.</p><h3>Topics Covered:</h3><ul><li>Linear and Logistic Regression</li><li>Decision Trees and Random Forests</li><li>Support Vector Machines (SVM)</li><li>K-Nearest Neighbors (KNN)</li><li>Naive Bayes Classifier</li><li>K-Means Clustering</li><li>Principal Component Analysis (PCA)</li><li>Neural Networks basics</li><li>Model evaluation metrics</li><li>Real-world projects</li></ul><p><strong>⏱️ Duration: 12 hours | 🎯 Beginner-friendly with hands-on examples</strong></p>",
            ContentType.VIDEO,
            "https://www.youtube.com/watch?v=7eh4d6sabA0", // Machine Learning Full Course - freeCodeCamp
            "YOUTUBE",
            null, null, null, null,
            720, true, 3);
        
        // Chapter 4: TEXT - Supervised Learning
        createAndSaveChapter(topic5, "Supervised Learning Algorithms",
            "<h2>Classification Algorithms</h2><h3>1. Logistic Regression</h3><p>Despite the name, it's a classification algorithm. Predicts probability of binary outcome.</p><pre><code>from sklearn.linear_model import LogisticRegression\n\nmodel = LogisticRegression(max_iter=1000)\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_test)\n\n# Metrics\nfrom sklearn.metrics import accuracy_score, confusion_matrix, classification_report\nprint('Accuracy:', accuracy_score(y_test, y_pred))\nprint(confusion_matrix(y_test, y_pred))\nprint(classification_report(y_test, y_pred))</code></pre><h3>2. Decision Trees</h3><p>Tree-like model of decisions. Easy to interpret but prone to overfitting.</p><pre><code>from sklearn.tree import DecisionTreeClassifier\n\nmodel = DecisionTreeClassifier(max_depth=5, min_samples_split=10)\nmodel.fit(X_train, y_train)\n\n# Visualize\nfrom sklearn.tree import plot_tree\nimport matplotlib.pyplot as plt\nplt.figure(figsize=(20, 10))\nplot_tree(model, filled=True, feature_names=feature_names)\nplt.show()</code></pre><h3>3. Random Forest</h3><p>Ensemble of decision trees. More robust and less prone to overfitting.</p><pre><code>from sklearn.ensemble import RandomForestClassifier\n\nmodel = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)\nmodel.fit(X_train, y_train)\n\n# Feature importance\nimportances = model.feature_importances_\nindices = np.argsort(importances)[::-1]\nfor i in range(10):\n    print(f'{feature_names[indices[i]]}: {importances[indices[i]]:.4f}')</code></pre><h3>4. Support Vector Machine (SVM)</h3><p>Finds optimal hyperplane to separate classes. Effective in high-dimensional spaces.</p><pre><code>from sklearn.svm import SVC\n\nmodel = SVC(kernel='rbf', C=1.0, gamma='auto')\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_test)</code></pre><h2>Regression Algorithms</h2><h3>Linear Regression</h3><pre><code>from sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n\n# Coefficients\nprint('Intercept:', model.intercept_)\nprint('Coefficients:', model.coef_)\n\n# Predict\ny_pred = model.predict(X_test)\n\n# Evaluation\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\nprint('MAE:', mean_absolute_error(y_test, y_pred))\nprint('MSE:', mean_squared_error(y_test, y_pred))\nprint('RMSE:', np.sqrt(mean_squared_error(y_test, y_pred)))\nprint('R² Score:', r2_score(y_test, y_pred))</code></pre>",
            ContentType.TEXT, null, null, null, null, null, null, 30, true, 4);
        
        // Chapter 5: DOCUMENT - Scikit-learn Cheat Sheet
        createAndSaveChapter(topic5, "Scikit-learn Cheat Sheet & Reference Guide",
            "<h2>📄 Complete Scikit-learn Reference</h2><p>Download the comprehensive scikit-learn cheat sheet covering:</p><ul><li>Algorithm selection flowchart</li><li>All classification algorithms with parameters</li><li>All regression algorithms with parameters</li><li>Clustering algorithms</li><li>Dimensionality reduction techniques</li><li>Model evaluation metrics</li><li>Cross-validation strategies</li><li>Hyperparameter tuning methods (GridSearchCV, RandomizedSearchCV)</li><li>Feature preprocessing and scaling</li><li>Pipeline construction</li></ul><p><strong>Essential reference for any ML practitioner!</strong></p>",
            ContentType.DOCUMENT,
            null, null,
            "https://scikit-learn.org/stable/user_guide.html",
            "Scikit-Learn_Complete_Reference.pdf",
            "PDF",
            null,
            15, false, 5);
        
        // Chapter 6: TEXT - Model Evaluation
        createAndSaveChapter(topic5, "Model Evaluation & Validation",
            "<h2>Evaluation Metrics</h2><h3>Classification Metrics</h3><h4>1. Confusion Matrix</h4><table><tr><td></td><td>Predicted Negative</td><td>Predicted Positive</td></tr><tr><td>Actual Negative</td><td>TN (True Negative)</td><td>FP (False Positive)</td></tr><tr><td>Actual Positive</td><td>FN (False Negative)</td><td>TP (True Positive)</td></tr></table><h4>2. Metrics Derived from Confusion Matrix</h4><pre><code>Accuracy = (TP + TN) / (TP + TN + FP + FN)\nPrecision = TP / (TP + FP)  # How many predicted positives are correct?\nRecall (Sensitivity) = TP / (TP + FN)  # How many actual positives did we find?\nF1-Score = 2 * (Precision * Recall) / (Precision + Recall)\nSpecificity = TN / (TN + FP)</code></pre><p><strong>When to use which?</strong></p><ul><li><strong>Accuracy</strong> — Balanced datasets, all errors equally costly</li><li><strong>Precision</strong> — When false positives are costly (e.g., spam detection)</li><li><strong>Recall</strong> — When false negatives are costly (e.g., cancer detection)</li><li><strong>F1-Score</strong> — Balance between precision and recall</li></ul><h4>3. ROC Curve & AUC</h4><pre><code>from sklearn.metrics import roc_curve, auc\nimport matplotlib.pyplot as plt\n\n# Get predicted probabilities\ny_pred_proba = model.predict_proba(X_test)[:, 1]\n\n# Calculate ROC curve\nfpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)\nroc_auc = auc(fpr, tpr)\n\n# Plot\nplt.plot(fpr, tpr, label=f'AUC = {roc_auc:.2f}')\nplt.plot([0, 1], [0, 1], 'k--')\nplt.xlabel('False Positive Rate')\nplt.ylabel('True Positive Rate')\nplt.title('ROC Curve')\nplt.legend()\nplt.show()</code></pre><h3>Regression Metrics</h3><pre><code>MAE (Mean Absolute Error) = mean(|y_true - y_pred|)\n  → Average absolute difference, easy to interpret\n\nMSE (Mean Squared Error) = mean((y_true - y_pred)²)\n  → Penalizes large errors more heavily\n\nRMSE (Root Mean Squared Error) = √MSE\n  → Same units as target variable\n\nR² Score (Coefficient of Determination) = 1 - (SS_res / SS_tot)\n  → Proportion of variance explained (0 to 1, higher is better)</code></pre><h3>Cross-Validation</h3><p>Split data into k folds, train on k-1, test on 1, repeat k times.</p><pre><code>from sklearn.model_selection import cross_val_score, StratifiedKFold\n\n# K-Fold CV\nscores = cross_val_score(model, X, y, cv=5, scoring='accuracy')\nprint(f'Accuracy: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})')\n\n# Stratified K-Fold (maintains class distribution)\nskf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\nscores = cross_val_score(model, X, y, cv=skf, scoring='f1')\n\n# Time Series Split\nfrom sklearn.model_selection import TimeSeriesSplit\ntscv = TimeSeriesSplit(n_splits=5)\nfor train_idx, test_idx in tscv.split(X):\n    X_train, X_test = X[train_idx], X[test_idx]\n    y_train, y_test = y[train_idx], y[test_idx]</code></pre>",
            ContentType.TEXT, null, null, null, null, null, null, 25, true, 6);
        
        // Chapter 7: MIXED - Complete ML Project
        createAndSaveChapter(topic5, "Hands-On Project: Predictive Analytics Dashboard",
            "<h2>🚀 Project: Build a Complete ML Application</h2><p>In this comprehensive project, you'll build an end-to-end machine learning application with a web interface.</p><h3>📹 Video Walkthrough</h3><p>Watch the step-by-step implementation video below covering:</p><ul><li>Data collection and preprocessing</li><li>Exploratory Data Analysis (EDA)</li><li>Feature engineering techniques</li><li>Model training and comparison</li><li>Hyperparameter tuning</li><li>Building a Flask/Streamlit web app</li><li>Model deployment</li></ul><h3>📦 Project Resources</h3><p>Download the complete starter pack including:</p><ul><li>Dataset (housing prices / customer churn / stock prediction)</li><li>Jupyter notebooks with templates</li><li>Pre-built EDA scripts</li><li>Model training pipeline</li><li>Web app boilerplate code</li><li>Deployment scripts for Heroku/AWS</li></ul><h3>🎯 Learning Objectives</h3><ul><li>Complete ML pipeline from data to deployment</li><li>Production-ready code practices</li><li>API development for model serving</li><li>Docker containerization</li><li>CI/CD for ML models</li><li>Monitoring and retraining strategies</li></ul><h3>Tech Stack</h3><pre><code># Core ML\npandas, numpy, scikit-learn, matplotlib, seaborn\n\n# Deep Learning (optional)\ntensorflow / pytorch\n\n# Web Framework\nflask / fastapi / streamlit\n\n# Deployment\ndocker, gunicorn, nginx\n\n# Monitoring\nprometheus, grafana, mlflow</code></pre><h3>Expected Outcome</h3><p>A fully functional ML web application that:</p><ol><li>Accepts user input via web interface</li><li>Processes features in real-time</li><li>Returns predictions with confidence scores</li><li>Displays model performance metrics</li><li>Logs predictions for monitoring</li></ol>",
            ContentType.MIXED,
            "https://www.youtube.com/watch?v=xl0N7tHiwlw", // End-to-end ML project
            "YOUTUBE",
            "https://github.com/microsoft/ML-For-Beginners",
            "ML_Project_Starter_Pack.zip",
            "ZIP",
            null,
            120, true, 7);
        
        // Chapter 8: VIDEO - Deep Learning Introduction
        createAndSaveChapter(topic5, "Deep Learning & Neural Networks - Video Course",
            "<h2>🧠 Introduction to Deep Learning</h2><p>Dive into neural networks and deep learning fundamentals with this comprehensive video tutorial.</p><h3>Course Content:</h3><ul><li>Perceptrons and activation functions</li><li>Backpropagation algorithm</li><li>Gradient descent and optimization</li><li>Building neural networks with TensorFlow/Keras</li><li>Convolutional Neural Networks (CNNs) for images</li><li>Recurrent Neural Networks (RNNs) for sequences</li><li>Transfer learning with pre-trained models</li><li>Practical tips for training deep networks</li></ul><p><strong>⏱️ Duration: 3 hours | 🎯 Intermediate level with code examples</strong></p>",
            ContentType.VIDEO,
            "https://www.youtube.com/watch?v=aircAruvnKk", // Neural Networks by 3Blue1Brown
            "YOUTUBE",
            null, null, null, null,
            180, false, 8);
        
        // Chapter 9: TEXT - Feature Engineering
        createAndSaveChapter(topic5, "Feature Engineering Best Practices",
            "<h2>Feature Engineering Techniques</h2><p>Feature engineering is the process of creating new features or transforming existing ones to improve model performance.</p><h3>1. Handling Missing Data</h3><pre><code># Check missing values\ndf.isnull().sum()\n\n# Drop rows/columns\ndf.dropna(axis=0)  # Drop rows\ndf.dropna(axis=1, thresh=0.5*len(df))  # Drop cols with >50% missing\n\n# Imputation\nfrom sklearn.impute import SimpleImputer\nimputer = SimpleImputer(strategy='mean')  # or 'median', 'most_frequent'\ndf_filled = imputer.fit_transform(df)\n\n# Advanced: KNN Imputer\nfrom sklearn.impute import KNNImputer\nimputer = KNNImputer(n_neighbors=5)\ndf_filled = imputer.fit_transform(df)</code></pre><h3>2. Encoding Categorical Variables</h3><pre><code># Label Encoding (ordinal: low, medium, high)\nfrom sklearn.preprocessing import LabelEncoder\nle = LabelEncoder()\ndf['education_encoded'] = le.fit_transform(df['education'])\n\n# One-Hot Encoding (nominal: red, blue, green)\npd.get_dummies(df, columns=['color'], drop_first=True)\n\n# Ordinal Encoding\nfrom sklearn.preprocessing import OrdinalEncoder\nenc = OrdinalEncoder(categories=[['low', 'medium', 'high']])\ndf['level_encoded'] = enc.fit_transform(df[['level']])</code></pre><h3>3. Feature Scaling</h3><pre><code># Standardization (zero mean, unit variance)\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\n\n# Normalization (min-max scaling to [0, 1])\nfrom sklearn.preprocessing import MinMaxScaler\nscaler = MinMaxScaler()\nX_normalized = scaler.fit_transform(X)\n\n# Robust Scaling (resistant to outliers)\nfrom sklearn.preprocessing import RobustScaler\nscaler = RobustScaler()\nX_robust = scaler.fit_transform(X)</code></pre><h3>4. Feature Creation</h3><pre><code># Polynomial features\nfrom sklearn.preprocessing import PolynomialFeatures\npoly = PolynomialFeatures(degree=2, include_bias=False)\nX_poly = poly.fit_transform(X)\n\n# Interaction features\ndf['price_per_sqft'] = df['price'] / df['sqft']\ndf['bedroom_bath_ratio'] = df['bedrooms'] / df['bathrooms']\n\n# Date features\ndf['date'] = pd.to_datetime(df['date'])\ndf['year'] = df['date'].dt.year\ndf['month'] = df['date'].dt.month\ndf['day_of_week'] = df['date'].dt.dayofweek\ndf['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)</code></pre><h3>5. Feature Selection</h3><pre><code># Correlation-based\ncorr_matrix = df.corr()\nhigh_corr = corr_matrix['target'].abs().sort_values(ascending=False)\nselected_features = high_corr[high_corr > 0.5].index\n\n# Variance Threshold\nfrom sklearn.feature_selection import VarianceThreshold\nselector = VarianceThreshold(threshold=0.1)\nX_selected = selector.fit_transform(X)\n\n# Recursive Feature Elimination\nfrom sklearn.feature_selection import RFE\nfrom sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression()\nrfe = RFE(model, n_features_to_select=10)\nX_selected = rfe.fit_transform(X, y)\n\n# Feature Importance (tree-based models)\nfrom sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier()\nmodel.fit(X, y)\nimportances = model.feature_importances_\nindices = np.argsort(importances)[::-1]</code></pre><h3>6. Handling Imbalanced Data</h3><pre><code># SMOTE (Synthetic Minority Over-sampling Technique)\nfrom imblearn.over_sampling import SMOTE\nsmote = SMOTE(random_state=42)\nX_resampled, y_resampled = smote.fit_resample(X, y)\n\n# Class weights\nfrom sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression(class_weight='balanced')\n\n# Under-sampling\nfrom imblearn.under_sampling import RandomUnderSampler\nrus = RandomUnderSampler(random_state=42)\nX_resampled, y_resampled = rus.fit_resample(X, y)</code></pre>",
            ContentType.TEXT, null, null, null, null, null, null, 30, true, 9);
        
        // Chapter 10: DOCUMENT - ML Interview Prep
        createAndSaveChapter(topic5, "Machine Learning Interview Questions & Answers",
            "<h2>📚 ML Interview Preparation Guide</h2><p>Comprehensive guide covering 150+ machine learning interview questions with detailed answers.</p><h3>Topics Covered:</h3><ul><li><strong>Theoretical Questions</strong><ul><li>Bias vs Variance tradeoff</li><li>Overfitting and regularization</li><li>Cross-validation techniques</li><li>Probability and statistics fundamentals</li></ul></li><li><strong>Algorithm-Specific Questions</strong><ul><li>Linear/Logistic Regression</li><li>Decision Trees and Random Forests</li><li>SVM and kernel tricks</li><li>Neural Networks and backpropagation</li><li>Clustering algorithms</li></ul></li><li><strong>Practical/Coding Questions</strong><ul><li>Implementing algorithms from scratch</li><li>Feature engineering scenarios</li><li>Model evaluation strategies</li><li>Debugging ML pipelines</li></ul></li><li><strong>System Design</strong><ul><li>ML system architecture</li><li>Scalability considerations</li><li>Real-time vs batch predictions</li><li>A/B testing frameworks</li></ul></li></ul><p><strong>Perfect for MAANG and ML Engineer interviews!</strong></p>",
            ContentType.DOCUMENT,
            null, null,
            "https://www.interviewbit.com/machine-learning-interview-questions/",
            "ML_Interview_Questions_Guide.pdf",
            "PDF",
            null,
            40, false, 10);
        
        System.out.println("✅ Successfully enriched Topic 5 with 10 comprehensive ML chapters!");
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