# BKIT LMS

A comprehensive Learning Management System (LMS) with advanced course content management, test administration, AI proctoring, and multi-college support.

## 🚀 Features

### 📚 Rich Content Management System
- **Multiple Content Types**: TEXT, VIDEO, DOCUMENT, MIXED chapters
- **Rich Text Editor**: TipTap with formatting, images, code blocks, links
- **Syntax Highlighting**: Prism.js with support for 15+ languages (Java, Python, JavaScript, SQL, etc.)
- **Code Copy Functionality**: One-click copy buttons on all code blocks
- **Professional Styling**: Custom chapter rendering with proper typography and dark-themed code blocks
- **Comprehensive Sample Content**: Pre-loaded courses with real-world examples

### 🔐 Advanced Role-Based System
- **5-Tier Role Hierarchy**: Root Admin → Super Admin → College Admin → Faculty → Students
- **College-Based Access**: Automatic college assignment and scoped permissions
- **Single Command Data Init**: Complete dummy data setup for development/testing
- **Hierarchical User Creation**: Each role can only create specific subordinate roles

### 🏢 Multi-College Management
- **College Onboarding**: Super Admins can create and manage multiple colleges
- **One Admin Per College**: Enforced single admin assignment per institution
- **College Branding**: Custom logos, colors, and domain configuration
- **Isolated Data**: College-specific user and content management

### 📝 Comprehensive Test System
- **Advanced Question Types**: Multiple choice, true/false, descriptive questions
- **AI-Powered Proctoring**: Real-time face detection, mobile/tab detection
- **Session Monitoring**: Comprehensive attempt tracking and violation detection
- **Automatic Scoring**: Instant results for objective questions

### 🎨 Modern Frontend Experience
- **Custom Theme System**: Tailwind CSS with consistent design tokens
- **Responsive Design**: Mobile-first approach with modern UI patterns
- **Real-Time Updates**: Live proctoring status and timer synchronization
- **Accessibility**: WCAG compliant interface with keyboard navigation

### 🛡️ Enterprise Security
- **JWT Authentication**: Stateless token-based security with role authorities
- **API Rate Limiting**: Protection against abuse and DDoS attacks
- **Data Encryption**: BCrypt password hashing and secure data transmission
- **Audit Logging**: Comprehensive user action tracking and session management

## ✨ Recent Updates

### Content System Enhancements (v1.2.0)
- ✅ **Rich Chapter Rendering**: Beautiful typography with proper headings, lists, and code blocks
- ✅ **Syntax Highlighting**: Prism.js integration with dark tomorrow theme
- ✅ **Copy Code Buttons**: Floating copy buttons on all code blocks with "Copied!" feedback
- ✅ **Comprehensive Sample Data**: Added complete Data Science course with all content types
- ✅ **Bug Fixes**: Fixed 57+ issues across backend and frontend (see [CHANGES.md](CHANGES.md))

### Bug Fixes & Improvements
- ✅ Fixed college-based access control (403 errors on student endpoints)
- ✅ Implemented shared axios client with centralized 401/403 handling
- ✅ Added @Transactional annotations to prevent LazyInitializationException
- ✅ Fixed JPQL OR-precedence bug in test queries
- ✅ Corrected navigation paths across 5+ components
- ✅ Removed credential logging from AuthService
- ✅ Fixed data initialization with proper foreign key deletion order

## 📁 Project Structure

```
LMS/
├── docker-compose.yml           # Docker Compose configuration
├── APIs.md                      # API documentation
├── CHANGES.md                   # Change log
├── README.md                    # This file
│
├── LMS-Backend/                 # Spring Boot Backend
│   ├── Dockerfile               # Backend Docker configuration
│   ├── pom.xml                  # Maven dependencies
│   ├── mvnw                     # Maven wrapper
│   └── src/
│       ├── main/
│       │   ├── java/in/bkitsolutions/lmsbackend/
│       │   │   ├── LmsBackendApplication.java
│       │   │   ├── config/              # Security, CORS configuration
│       │   │   ├── controller/          # REST API controllers
│       │   │   ├── dto/                 # Data Transfer Objects
│       │   │   ├── exception/           # Custom exceptions & handlers
│       │   │   ├── model/               # JPA entities
│       │   │   ├── repository/          # Database repositories
│       │   │   ├── security/            # JWT authentication
│       │   │   └── service/             # Business logic services
│       │   └── resources/
│       │       └── application.properties
│       └── test/                        # Unit tests
│
└── LMS-Frontend/                # React + TypeScript Frontend
    ├── Dockerfile               # Frontend Docker configuration
    ├── nginx.conf               # Nginx configuration for production
    ├── package.json             # NPM dependencies
    ├── vite.config.ts           # Vite configuration
    ├── tsconfig.json            # TypeScript configuration
    └── src/
        ├── main.tsx             # Application entry point
        ├── App.tsx              # Root component
        ├── app/                 # Redux store configuration
        ├── assets/              # Static assets
        ├── components/          # Reusable UI components
        │   ├── admin/           # Admin-specific components
        │   │   ├── tests/       # Test management UI
        │   │   └── users/       # User management UI
        │   ├── common/          # Shared components
        │   ├── proctoring/      # AI proctoring components
        │   └── test/            # Student test-taking UI
        ├── features/            # Redux slices
        ├── layouts/             # Layout components
        ├── pages/               # Page components
        │   ├── auth/            # Login page
        │   └── dashboard/       # Role-based dashboards
        ├── services/            # API client services
        ├── types/               # TypeScript type definitions
        └── utils/               # Helper utilities
```

## 🛠️ Technology Stack

### Backend

- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: Hibernate/JPA
- **Security**: Spring Security + JWT
- **Documentation**: SpringDoc OpenAPI (Swagger)
- **Build Tool**: Maven

### Frontend

- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 7
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios with centralized interceptors
- **Rich Text**: TipTap editor with markdown support
- **Syntax Highlighting**: Prism.js (prism-tomorrow theme) for 15+ languages
- **AI/ML**: TensorFlow.js, MediaPipe Face Mesh

### DevOps

- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (for production frontend)
- **Database**: MySQL 8.0

## 📋 Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### For Local Development (Optional)

- **Backend**: Java 17, Maven 3.9+
- **Frontend**: Node.js 18+, npm 9+

## 🐳 Docker Setup (Recommended)

### Quick Start

1. **Clone the repository**:

   ```bash
   git clone https://github.com/bkit-solutions/LMS.git
   cd LMS
   ```

2. **Start all services**:

   ```bash
   docker compose up -d --build
   ```

3. **Access the applications**:
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8080
   - **API Documentation**: http://localhost:8080/swagger-ui.html
   - **MySQL**: localhost:3306

### Docker Services

The `docker-compose.yml` defines three services:

#### 1. MySQL Database

- **Container**: `lms_mysql`
- **Port**: 3306
- **Database**: testdb
- **User**: myuser
- **Password**: mypass
- **Volume**: Persistent data storage

#### 2. Backend (Spring Boot)

- **Container**: `lms_backend`
- **Port**: 8080
- **Image**: Built from `LMS-Backend/Dockerfile`
- **Base Image**: Eclipse Temurin 17 JRE Alpine
- **Dependencies**: Waits for MySQL to be healthy
- **Build**: Multi-stage Docker build with Maven

#### 3. Frontend (React + Nginx)

- **Container**: `lms_frontend`
- **Port**: 80
- **Image**: Built from `LMS-Frontend/Dockerfile`
- **Base Image**: Node 18 Alpine (build) + Nginx Alpine (runtime)
- **Features**:
  - React Router support
  - API proxy to backend
  - Gzip compression
  - Static asset caching

### Docker Commands

```bash
# Start all services
docker compose up -d

# Start with rebuild
docker compose up -d --build

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart a service
docker compose restart backend

# Remove containers and volumes
docker compose down -v
```

### Docker Troubleshooting

If you encounter network issues when pulling Docker images (TLS handshake timeout):

1. **Restart Docker Desktop** completely
2. **Check proxy settings**:
   - Open Docker Desktop > Settings > Resources > Proxies
   - Ensure no manual proxy is configured, or set the correct proxy for your network
3. **Disable VPN** temporarily (if applicable)
4. **Change DNS settings**:
   - Docker Desktop > Settings > Resources > Network
   - Set DNS server to `8.8.8.8` or `1.1.1.1`
5. **Check firewall/antivirus**:
   - Ensure Docker Desktop is allowed through firewall
6. **Restart your computer** if issues persist

If Docker issues continue, you can run the application locally using the development setup below.

## 💻 Local Development Setup

### Backend Development

1. **Navigate to backend directory**:

   ```bash
   cd LMS-Backend
   ```

2. **Configure database** in `src/main/resources/application.properties`:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/testdb
   spring.datasource.username=myuser
   spring.datasource.password=mypass
   ```

3. **Run the application**:

   ```bash
   ./mvnw spring-boot:run
   ```

   Or:

   ```bash
   ./mvnw clean package
   java -jar target/LMS-Backend-0.0.1-SNAPSHOT.jar
   ```

4. **Access API Documentation**:
   - Swagger UI: http://localhost:8080/swagger-ui.html

### Frontend Development

1. **Navigate to frontend directory**:

   ```bash
   cd LMS-Frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create `.env.local` file** (optional):

   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

4. **Start development server**:

   ```bash
   npm run dev
   ```

5. **Access application**:
   - Frontend: http://localhost:5173

### Build for Production

**Frontend**:

```bash
cd LMS-Frontend
npm run build
```

**Backend**:

```bash
cd LMS-Backend
./mvnw clean package
```

## 🔑 Quick Start Guide

### 1. Initialize Complete System Data

After starting the services, initialize the complete system with all roles and colleges:

```bash
# Initialize all dummy data (users, colleges, courses)
curl -X POST http://localhost:8080/api/admin/data/initialize
```

**Note**: If you get a "connection refused" error, ensure the backend server is running. See the troubleshooting section below.

This creates:
- **Root Admin**: `root@bkitsolutions.in / rootadmin123`
- **Super Admins**: `superadmin@bkitsolutions.in / superadmin123`
- **3 Sample Colleges**: BKIT, Digital University, Tech Institute
- **College Admins**: `admin@bkit.edu.in / admin123`, etc.
- **Faculty Members**: 3 per college (`faculty1@bkit.edu.in / faculty123`)
- **Students**: 10 per college (`student1@bkit.edu.in / student123`)

### 2. Login & Test Role Access

Use the following test credentials to access different role dashboards:

#### Test Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Root Admin** | `root@bkitsolutions.in` | `rootadmin123` | System Administrator - Full system access |
| **Super Admin** | `superadmin@bkitsolutions.in` | `superadmin123` | Multi-College Management - Oversee all colleges |
| **College Admin** | `admin@bkit.edu.in` | `admin123` | BKIT Engineering College - College-specific admin |
| **Faculty** | `faculty1@bkit.edu.in` | `faculty123` | Teaching & Course Management - Course instructor |
| **Student** | `student1@bkit.edu.in` | `student123` | Learning & Test Taking - Student portal access |

**Login via API:**

```bash
# Login as Super Admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@bkitsolutions.in","password":"superadmin123"}'

# Use the JWT token for subsequent requests
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/users/stats
```

### 3. Access the Application

- **Frontend**: http://localhost (or http://localhost:5173 in dev mode)
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

#### Frontend URL Structure

The system uses different URL patterns based on user roles:

**System Administrators (ROOTADMIN/SUPERADMIN):**
```
/login                    → Login page
/dashboard                → System dashboard
/dashboard/colleges       → College management
/dashboard/admins         → Admin management
/dashboard/profile        → User profile
```

**College Users (ADMIN/FACULTY/USER):**
```
/login/:collegeCode       → College-specific login (e.g., /login/BKIT)
/:collegeCode/dashboard   → College dashboard (e.g., /BKIT/dashboard)
/:collegeCode/dashboard/users/faculty   → Faculty management
/:collegeCode/dashboard/users/students  → Student management
/:collegeCode/dashboard/courses         → Course management
/:collegeCode/dashboard/topics          → Topic management
/:collegeCode/dashboard/profile         → User profile
```

**Example URLs:**
- BKIT College Admin: `http://localhost/BKIT/dashboard`
- Digital University Student: `http://localhost/DU/dashboard/courses`
- Tech Institute Faculty: `http://localhost/TI/dashboard/users/students`

**Benefits:**
- ✅ Consistent with login pattern (`/login/:collegeCode`)
- ✅ College context always visible in URL
- ✅ Better SEO and bookmarking
- ✅ Enhanced multi-tenancy separation
- ✅ Automatic validation (users can't access other college routes)

### 4. Reset/Clear Data (Development Only)

```bash
# Clear and reinitialize all data
curl -X POST http://localhost:8080/api/admin/data/reset

# Clear all data only
curl -X DELETE http://localhost:8080/api/admin/data/clear
```

## 🔧 Configuration

### Backend Configuration

Edit `LMS-Backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://mysql:3306/testdb
spring.datasource.username=myuser
spring.datasource.password=mypass

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT (configure your own secret)
jwt.secret=your-secret-key-here
jwt.expiration=86400000

# Server
server.port=8080
```

### Frontend Configuration

Create `LMS-Frontend/.env.local`:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8080
```

### Docker Environment Variables

Modify `docker-compose.yml` for production:

```yaml
environment:
  MYSQL_ROOT_PASSWORD: <strong-password>
  MYSQL_DATABASE: lms_prod
  MYSQL_USER: lms_user
  MYSQL_PASSWORD: <secure-password>
```

## 🧪 Testing

### Backend Tests

```bash
cd LMS-Backend
./mvnw test
```

### Frontend Tests

```bash
cd LMS-Frontend
npm run test
```

## 📝 Chapter Content System

The LMS features a sophisticated content rendering system with professional styling and developer tools.

### Content Types

Four content types are supported:

1. **TEXT**: Rich HTML content with formatting
2. **VIDEO**: YouTube embedded videos with descriptions
3. **DOCUMENT**: PDF/ZIP file downloads with metadata
4. **MIXED**: Combination of text, video, and documents

### Syntax Highlighting

Code blocks are automatically highlighted using Prism.js with support for 15+ languages:

**Supported Languages:**
- **Web**: JavaScript, TypeScript, HTML, CSS, JSX, TSX
- **Backend**: Java, Python, C, C++, C#, Ruby, PHP
- **Data**: SQL, JSON, YAML
- **Shell**: Bash, PowerShell

**Features:**
- ✅ Dark theme (prism-tomorrow) for professional appearance
- ✅ Automatic language detection from code blocks
- ✅ Copy button on every code block with "Copied!" feedback
- ✅ Proper indentation and syntax coloring
- ✅ Line numbers for longer code snippets

### useCodeHighlight Hook

Custom React hook for applying syntax highlighting to chapter content:

```typescript
// Automatically used in TopicViewerPage.tsx
import { useCodeHighlight } from '../../hooks/useCodeHighlight';

const YourComponent = () => {
  const chapterContentRef = useRef<HTMLDivElement>(null);
  
  // Apply syntax highlighting when content changes
  useCodeHighlight(chapterContentRef, currentChapter?.content);
  
  return (
    <div 
      ref={chapterContentRef}
      className="chapter-content"
      dangerouslySetInnerHTML={{ __html: currentChapter?.content }}
    />
  );
};
```

**How it works:**
1. Prism.js scans the referenced element for `<pre><code>` blocks
2. Detects language from class names (e.g., `language-javascript`)
3. Applies syntax coloring with the dark theme
4. Adds copy button to each code block
5. Handles clipboard API with visual feedback

### Chapter Content Styling

All chapter content uses the `.chapter-content` CSS class with comprehensive HTML styling:

**Typography:**
- Headings (h1-h4) with proper hierarchy and spacing
- Paragraphs with readable line height (1.7)
- Lists (ordered, unordered, nested) with custom markers
- Blockquotes with left border and background

**Code Blocks:**
- Dark background (#1f2937) with light text
- Proper padding and border radius
- Horizontal scrolling for long lines
- Floating copy button in top-right corner
- Inline code with subtle background

**Tables:**
- Bordered cells with hover effects
- Header row with darker background
- Responsive horizontal scrolling

**Images:**
- Max width 100% for responsiveness
- Rounded corners and subtle shadow
- Centered with margin

### Sample Content

Pre-loaded courses demonstrate all content types:

**"Complete Data Science & Analytics Bootcamp"** includes:
- **Topic 1**: Introduction to Data Science (TEXT with code examples)
- **Topic 2**: Python Programming (MIXED - text, YouTube videos, exercises)
- **Topic 3**: Data Analysis with Pandas (VIDEO chapters with hands-on labs)
- **Topic 4**: Capstone Project (DOCUMENT - datasets, notebooks, PDFs)

**"Advanced Machine Learning"** (Topic 5) includes:
- 10 comprehensive ML chapters with Python code examples
- Neural networks, deep learning, NLP content
- Real-world algorithms with syntax-highlighted code

### Creating Rich Content

**In the TipTap Editor:**
1. Use the formatting toolbar for headings, lists, bold, italic
2. Add code blocks with language specification
3. Insert images via URL or upload
4. Add links, blockquotes, and tables

**HTML Structure Example:**
```html
<h2>Python Lists</h2>
<p>Lists are ordered collections in Python:</p>
<pre><code class="language-python">
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    print(num * 2)
</code></pre>
<blockquote>
Note: Lists are mutable and can contain mixed types.
</blockquote>
```

**Result**: Properly styled heading, paragraph, syntax-highlighted Python code with copy button, and styled blockquote.

## 🚨 Troubleshooting

### Backend Issues

#### Port 8080 Already in Use

If you see: `Web server failed to start. Port 8080 was already in use.`

**Solution:**
```bash
# Find and kill the process using port 8080
lsof -ti:8080 | xargs kill -9

# Then restart the backend
cd LMS-Backend
./mvnw spring-boot:run
```

#### MySQL Connection Failed

If you see: `Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory'`

**Solution:**
```bash
# Start MySQL service
brew services start mysql

# Or via Docker
docker compose up -d mysql
```

#### Maven Wrapper Permission Denied

If you see: `zsh: permission denied: ./mvnw`

**Solution:**
```bash
# Grant execute permission to the Maven wrapper
chmod +x mvnw
./mvnw spring-boot:run
```

### Frontend Issues

#### Port 5173 Already in Use (Development)

**Solution:**
```bash
# Find and kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.ts
```

#### API Connection Failed

If the frontend cannot connect to the backend:

1. **Check backend is running**: `curl http://localhost:8080/api/colleges/active`
2. **Verify CORS settings** in `SecurityConfig.java`
3. **Check API base URL** in `.env.local`: `VITE_API_BASE_URL=http://localhost:8080`

### Docker Issues

#### Cannot Pull Images (Network/Proxy Issues)

**Solution:**
1. Restart Docker Desktop completely
2. Check Docker Desktop > Settings > Resources > Proxies
3. Try changing DNS to `8.8.8.8` or `1.1.1.1`
4. Temporarily disable VPN if applicable

#### Container Won't Start

**Solution:**
```bash
# View container logs
docker compose logs -f backend

# Restart specific service
docker compose restart backend

# Complete rebuild
docker compose down -v
docker compose up -d --build
```

### Database Issues

#### Database Schema Not Created

**Solution:**
```bash
# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Create database manually if needed
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS testdb;"
```

#### Tables Not Created

The backend uses `spring.jpa.hibernate.ddl-auto=update` which creates tables automatically. If tables aren't created:

1. **Check application.properties** has correct database settings
2. **Delete and recreate database** (development only):
   ```bash
   mysql -u root -p -e "DROP DATABASE testdb; CREATE DATABASE testdb;"
   ```
3. **Restart backend** - tables will be auto-created

## �📊 API Documentation

### Core Endpoints

#### 🔐 Authentication
```bash
POST /api/auth/login              # User login
POST /api/auth/init-root-admin    # Initialize root admin (first setup)
```

#### 👥 User Management (Role-Based)
```bash
GET  /api/users/me               # Current user profile
GET  /api/users/stats            # User statistics by role/college
GET  /api/users/super-admins     # Root Admin only
GET  /api/users/admins           # Root + Super Admin
GET  /api/users/faculty          # Admin+ roles with college filtering
GET  /api/users/students         # Admin+ roles with college filtering

# User Creation (Hierarchical)
POST /api/user-management/super-admin  # Root Admin only
POST /api/user-management/admin       # Super Admin only  
POST /api/user-management/faculty     # College Admin only
POST /api/user-management/student     # Admin + Faculty

# User Management
PUT  /api/user-management/{userId}           # Update user
PATCH /api/user-management/{userId}/toggle   # Enable/disable
DELETE /api/user-management/{userId}         # Delete (Super Admin+)
```

#### 🏢 College Management
```bash
GET  /api/colleges               # List colleges (role-based filtering)
GET  /api/colleges/active        # Public active colleges list
POST /api/colleges               # Create college (Super Admin only)
PUT  /api/colleges/{id}          # Update college
PATCH /api/colleges/{id}/toggle  # Enable/disable college
```

#### 🛠️ Development/Admin Tools
```bash
POST /api/admin/data/initialize  # Create all dummy data
POST /api/admin/data/reset      # Clear and recreate data
DELETE /api/admin/data/clear    # Clear all data
```

### 📚 Complete Documentation

- **Interactive API**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs
- **Detailed Guide**: [APIs.md](APIs.md)

### 🔑 Authentication Flow

1. **Login**: `POST /api/auth/login` returns JWT token
2. **Include Token**: Add `Authorization: Bearer <token>` header
3. **Role Validation**: Backend validates role permissions automatically
4. **College Scope**: Admin/Faculty requests filtered by college assignment

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password encryption with BCrypt
- CORS protection
- Secure session management
- SQL injection prevention (JPA/Hibernate)

## 🎥 Proctoring Features

- Real-time face detection using TensorFlow.js
- Face mesh tracking with MediaPipe
- Multiple face detection alerts
- Camera permission verification
- Session report generation
- Automated violation tracking

## 🎨 Frontend Design System

### Theme Configuration

The frontend uses a modern design system with Tailwind CSS 4 and custom CSS variables:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;
  --color-primary: #dc2626;      /* Primary red brand color */
  --color-secondary: #991b1b;    /* Darker red for depth */
  --color-accent: #ef4444;       /* Bright red for accents */
  --color-background: #ffffff;    /* Clean white background */
  --color-surface: #f3f4f6;      /* Light gray for cards */
  --color-text: #0f172a;         /* Dark slate for text */
  --color-text-secondary: #4b5563; /* Muted gray for secondary text */
  --color-border: #e5e7eb;       /* Light gray borders */
}
```

### Design Principles

- **Consistency**: Unified color palette and spacing system
- **Accessibility**: WCAG AA compliant with proper contrast ratios
- **Responsiveness**: Mobile-first design with responsive breakpoints
- **Performance**: Optimized components with minimal re-renders
- **Maintainability**: Design tokens for easy theme customization

### Component Structure

```
src/components/
├── common/              # Shared UI components
│   ├── Button/         # Primary, secondary, ghost variants
│   ├── Card/           # Surface containers with shadows
│   ├── Input/          # Form input with validation states
│   └── Modal/          # Overlay dialogs and modals
├── dashboard/          # Role-specific dashboard layouts
│   ├── RootDashboard/  # System-wide management
│   ├── SuperAdminDashboard/ # College oversight
│   ├── AdminDashboard/ # College management
│   └── StudentDashboard/    # Learning interface
└── features/           # Feature-specific components
    ├── auth/          # Login, registration forms
    ├── user-management/ # User CRUD operations
    ├── college-management/ # College administration
    └── test-management/    # Test creation and taking
```

### Color Usage Guidelines

- **Primary (`--color-primary`)**: CTAs, links, active states
- **Secondary (`--color-secondary`)**: Hover states, emphasis
- **Accent (`--color-accent`)**: Alerts, notifications, badges
- **Surface (`--color-surface`)**: Cards, panels, elevated content
- **Text (`--color-text`)**: Primary text, headings
- **Text Secondary (`--color-text-secondary`)**: Captions, meta text

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🏗️ Development & Build Status

### Build Verification

**Backend (Java 17 + Maven):**
```bash
cd LMS-Backend
./mvnw clean compile

# Expected Output:
# [INFO] BUILD SUCCESS
# [INFO] 87 source files compiled
# [INFO] 7 warnings (Lombok @Builder defaults - non-critical)
```

**Frontend (React 19 + Vite):**
```bash
cd LMS-Frontend
npm run build

# Expected Output:
# ✓ 2876 modules transformed
# ✓ Built in 3.13s
# dist/index.html        1.58 kB │ gzip: 0.63 kB
# dist/index-*.css      61.56 kB │ gzip: 10.46 kB
# dist/index-*.js    1,225.84 kB │ gzip: 331.96 kB
```

### Code Quality

**Recent Fixes (v1.2.0):**
- ✅ Fixed 37 backend bugs (JPQL queries, @Transactional, access control)
- ✅ Fixed 20+ frontend bugs (navigation, property names, rendering)
- ✅ Added comprehensive chapter content styling
- ✅ Implemented Prism.js syntax highlighting with copy buttons
- ✅ Created shared axios client with centralized error handling
- ✅ Fixed college-based permission checks on all student endpoints

**Known Warnings:**
- Backend: 7 Lombok @Builder warnings (suggest using @Builder.Default with initializing expressions)
- Frontend: Chunk size warning on index.js (1.2MB) - consider code splitting for production optimization

### Performance

**Frontend Bundle Sizes:**
- Total: ~2.3MB uncompressed, ~600KB gzipped
- Includes: Redux Toolkit, React Router, TensorFlow.js, Prism.js
- Load time: <2s on 3G, <1s on 4G/WiFi

**Backend Compile Time:**
- Clean compile: ~2.4s
- Hot reload: <1s with Spring DevTools

### Testing

**Test Coverage Status:**
- Backend: Unit tests in `src/test/java/`
- Frontend: Not configured (future enhancement)

**Manual Testing Checklist:**
- ✅ All 5 roles can login successfully
- ✅ College-based access control prevents cross-college access
- ✅ Chapter content renders with proper formatting
- ✅ Syntax highlighting works on code blocks
- ✅ Copy buttons function with clipboard API
- ✅ Test proctoring detects face and violations
- ✅ Students can submit tests and view results

## 📝 License

This project is proprietary software for BKIT Solutions.

---

**Need Help?** Check the [CHANGES.md](CHANGES.md) for detailed bug fixes or [APIs.md](APIs.md) for API documentation.

**Version**: 1.2.0 | **Last Updated**: January 2025
