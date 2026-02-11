/**
 * Development Test Helper Utility
 * 
 * IMPORTANT: This utility is for development ONLY.
 * DO NOT use these functions or credentials in production.
 * 
 * Usage:
 * 1. Start the backend: cd LMS-Backend && ./mvnw spring-boot:run
 * 2. Initialize data: window.devHelper.initData()
 * 3. Login with: window.devHelper.testLogin('super-admin')
 * 4. Get credentials: window.devHelper.getCredentials()
 */

import { loginAsync } from '../features/auth/authSlice';
import { store } from '../app/store';

export interface TestCredentials {
  email: string;
  password: string;
  role: string;
  description: string;
}

export const DEV_CREDENTIALS: Record<string, TestCredentials> = {
  'root-admin': {
    email: 'root@bkitsolutions.in',
    password: 'rootadmin123',
    role: 'ROOTADMIN',
    description: 'System Administrator - Full system access'
  },
  'super-admin': {
    email: 'superadmin@bkitsolutions.in',
    password: 'superadmin123',
    role: 'SUPERADMIN',
    description: 'Multi-College Management - Oversee all colleges'
  },
  'college-admin': {
    email: 'admin@bkit.edu.in',
    password: 'admin123',
    role: 'ADMIN',
    description: 'BKIT Engineering College - College-specific admin'
  },
  'faculty': {
    email: 'faculty1@bkit.edu.in',
    password: 'faculty123',
    role: 'FACULTY',
    description: 'Teaching & Course Management - Course instructor'
  },
  'student': {
    email: 'student1@bkit.edu.in',
    password: 'student123',
    role: 'STUDENT',
    description: 'Learning & Test Taking - Student portal access'
  }
};

export class DevHelper {
  /**
   * Initialize all test data on the backend
   */
  async initData(): Promise<void> {
    try {
      console.log('🔄 Initializing test data...');
      const response = await fetch('http://localhost:8080/api/admin/data/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ Test data initialized successfully');
        console.log('📝 Available test accounts:');
        this.logCredentials();
      } else {
        console.error('❌ Failed to initialize data:', result.message);
      }
    } catch (error) {
      console.error('❌ Error initializing data:', error);
      console.log('💡 Make sure the backend is running: cd LMS-Backend && ./mvnw spring-boot:run');
    }
  }

  /**
   * Quick login with test credentials
   */
  async testLogin(roleKey: keyof typeof DEV_CREDENTIALS): Promise<void> {
    const credentials = DEV_CREDENTIALS[roleKey];
    if (!credentials) {
      console.error('❌ Invalid role key. Available roles:', Object.keys(DEV_CREDENTIALS));
      return;
    }

    try {
      console.log(`🔐 Logging in as ${credentials.role}...`);
      const result = await store.dispatch(loginAsync({
        email: credentials.email,
        password: credentials.password
      }));

      if (loginAsync.fulfilled.match(result)) {
        console.log(`✅ Successfully logged in as ${credentials.role}`);
        console.log('🎯 Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.error('❌ Login failed:', result.payload);
        console.log('💡 Try: devHelper.initData() first');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
    }
  }

  /**
   * Get all test credentials
   */
  getCredentials(): Record<string, TestCredentials> {
    this.logCredentials();
    return DEV_CREDENTIALS;
  }

  /**
   * Log credentials to console in a readable format
   */
  private logCredentials(): void {
    console.table(
      Object.entries(DEV_CREDENTIALS).map(([key, creds]) => ({
        Role: key,
        Email: creds.email,
        Password: creds.password,
        Type: creds.role,
        Description: creds.description
      }))
    );
  }

  /**
   * Reset all data (clears and reinitializes)
   */
  async resetData(): Promise<void> {
    await this.initData();
  }

  /**
   * Quick help
   */
  help(): void {
    console.log(`
🧪 BKIT LMS Development Helper

Available Commands:
- devHelper.initData()           → Initialize/reset test data
- devHelper.testLogin('role')    → Quick login (roles: root-admin, super-admin, college-admin, faculty, student)
- devHelper.getCredentials()     → Show all test credentials  
- devHelper.help()               → Show this help

Examples:
  devHelper.initData()                    // Setup fresh test data
  devHelper.testLogin('super-admin')      // Login as Super Admin
  devHelper.testLogin('student')          // Login as Student

Backend Setup:
  cd LMS-Backend && ./mvnw spring-boot:run

Frontend:
  http://localhost:5173/ or http://localhost:5174/
    `);
  }
}

// Create global instance for development
export const devHelper = new DevHelper();

// Expose globally in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).devHelper = devHelper;
  console.log('🧪 Development helper loaded! Type "devHelper.help()" for commands');
}