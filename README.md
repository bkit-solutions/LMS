# BKIT LMS

A Learning Management System (LMS) with frontend and backend components.

## Project Structure

- `LMS-Backend/`: Spring Boot backend application
- `LMS-Frontend/`: React frontend application using Vite

## Prerequisites

- Docker and Docker Compose installed

## Running with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/bkit-solutions/LMS.git
   cd LMS
   ```

2. Run the application:
   ```bash
   docker-compose up --build
   ```

3. Access the applications:
   - Frontend: http://localhost
   - Backend: http://localhost:8080
   - MySQL: localhost:3306

## Development Setup

### Backend

1. Navigate to `LMS-Backend/`
2. Ensure Java 17 and Maven are installed
3. Run: `mvn spring-boot:run`

### Frontend

1. Navigate to `LMS-Frontend/`
2. Ensure Node.js is installed
3. Run: `npm install && npm run dev`

## Environment Variables

For production, update the following in `LMS-Backend/src/main/resources/application.properties`:

- Database credentials
- JWT secret

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.