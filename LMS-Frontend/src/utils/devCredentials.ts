/**
 * Development Test Credentials
 * 
 * IMPORTANT: These credentials are for development/testing ONLY.
 * They are automatically created when you run the data initialization command.
 * 
 * Initialize test data:
 * curl -X POST http://localhost:8080/api/admin/data/initialize
 * 
 * Available Test Accounts:
 * 
 * ROOT ADMIN (System Administrator)
 * - Email: root@bkitsolutions.in
 * - Password: rootadmin123
 * - Access: Full system access, can create Super Admins
 * 
 * SUPER ADMIN (Multi-College Management)
 * - Email: superadmin@bkitsolutions.in
 * - Password: superadmin123
 * - Access: Manage multiple colleges, create College Admins
 * 
 * COLLEGE ADMIN (BKIT Engineering College)
 * - Email: admin@bkit.edu.in
 * - Password: admin123
 * - Access: College-specific administration, manage faculty/students
 * 
 * FACULTY (Teaching & Course Management)
 * - Email: faculty1@bkit.edu.in
 * - Password: faculty123
 * - Access: Course management, create/grade tests
 * 
 * STUDENT (Learning & Test Taking)
 * - Email: student1@bkit.edu.in
 * - Password: student123
 * - Access: Take tests, view courses and results
 * 
 * Additional Colleges:
 * - Digital University: admin@digitaluni.edu / admin123
 * - Tech Institute: admin@tech.edu / admin123
 * 
 * Each college has:
 * - 1 Admin
 * - 3 Faculty members (faculty1, faculty2, faculty3)
 * - 10 Students (student1 through student10)
 * 
 * Pattern: {role}{number}@{college_domain} / {role}123
 */

export const DEV_CREDENTIALS = {
  ROOT_ADMIN: {
    email: "root@bkitsolutions.in",
    password: "rootadmin123",
    role: "ROOTADMIN"
  },
  SUPER_ADMIN: {
    email: "superadmin@bkitsolutions.in", 
    password: "superadmin123",
    role: "SUPERADMIN"
  },
  COLLEGE_ADMIN: {
    email: "admin@bkit.edu.in",
    password: "admin123",
    role: "ADMIN"
  },
  FACULTY: {
    email: "faculty1@bkit.edu.in",
    password: "faculty123", 
    role: "FACULTY"
  },
  STUDENT: {
    email: "student1@bkit.edu.in",
    password: "student123",
    role: "STUDENT"
  }
} as const;

export default DEV_CREDENTIALS;