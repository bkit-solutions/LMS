LMS Backend — Spring Boot (JWT Auth)

Overview
- A minimal Learning Management System (LMS) backend built with Spring Boot, featuring role‑based authentication and a unified API response format.
- Authentication uses JWT. Roles supported: SUPERADMIN, ADMIN, USER.
- All API responses are wrapped in a global `ApiResponse<T>` with fields: `success`, `message`, and optional `data`.

Tech Stack
- Java 17+
- Spring Boot 3
- Spring Web, Spring Security, Validation (Jakarta)
- Maven

Project Structure
```
LMS-Backend/
├─ pom.xml
├─ src/main/java/in/bkitsolutions/lmsbackend/
│  ├─ LmsBackendApplication.java
│  ├─ config/SecurityConfig.java
│  ├─ controller/
│  │  ├─ AuthController.java
│  │  └─ UserController.java
│  ├─ dto/
│  │  ├─ ApiResponse.java
│  │  └─ AuthDtos.java
│  ├─ exception/GlobalExceptionHandler.java
│  ├─ model/
│  │  ├─ User.java
│  │  └─ UserType.java
│  ├─ repository/UserRepository.java
│  ├─ security/
│  │  ├─ JwtAuthenticationFilter.java
│  │  └─ JwtUtil.java
│  └─ service/AuthService.java
└─ src/main/resources/application.properties
```

Getting Started
1) Prerequisites
- Java 17+
- Maven (or use the included Maven Wrapper `./mvnw`)

2) Configure application.properties
- Update database and security settings as needed in `src/main/resources/application.properties`.

3) Build & Run
```
# build
./mvnw clean package

# run
./mvnw spring-boot:run
```
The application will start on the configured port (default 8080 if not overridden).

