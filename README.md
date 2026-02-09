# BKIT LMS

A comprehensive Learning Management System (LMS) with test management, proctoring features, and role-based access control.

## 🚀 Features

- **Role-Based Access Control**: Root Admin, Super Admin, Admin, and Student roles
- **Test Management**: Create, edit, and manage tests with multiple question types
- **AI-Powered Proctoring**: Real-time face detection and monitoring during tests
- **User Management**: Create and manage users across different roles
- **Session Reporting**: Track and analyze test attempts with detailed reports
- **Responsive UI**: Modern React-based interface with Tailwind CSS
- **RESTful API**: Well-documented Spring Boot backend with OpenAPI/Swagger

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
- **HTTP Client**: Axios
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

## 🔑 Default Access

After initial setup, initialize the root admin through the API:

```bash
curl -X POST http://localhost:8080/api/auth/init-root-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "root@example.com",
    "password": "securePassword123",
    "name": "Root Administrator"
  }'
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

## 📊 API Documentation

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs
- See [APIs.md](APIs.md) for detailed endpoint documentation

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
