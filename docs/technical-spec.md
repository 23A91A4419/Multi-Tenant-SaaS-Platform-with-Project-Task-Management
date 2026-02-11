# Technical Specification:

## Project Structure
The project is organized into separate backend and frontend directories to maintain a clear separation of concerns.

### Backend Structure

- backend/src/controllers: Contains request handling logic for API endpoints.
- backend/src/routes: Defines API routes and maps them to controllers.
- backend/src/middleware: Contains authentication, authorization, and tenant isolation middleware.
- backend/src/models: Defines database models and schema mappings.
- backend/src/services: Contains reusable business logic such as audit logging.
- backend/src/utils: Utility functions such as JWT helpers and password hashing.
- backend/migrations: Database migration files.
- backend/seeds: Database seed scripts.

### Frontend Structure

- frontend/src/components: Reusable UI components.
- frontend/src/pages: Page-level components such as Login, Dashboard, and Projects.
- frontend/src/services: API service layer for communicating with backend APIs.
- frontend/src/context: Global state management for authentication and user data.
## Development Setup Guide
### Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- PostgreSQL (for local development if not using Docker)

### Environment Variables

The backend requires environment variables for database connection, JWT configuration, and CORS settings. These variables are defined in a .env file or directly in docker-compose.yml.

Key variables include:
- DB_HOST
- DB_PORT
- DB_NAME
- DB_USER
- DB_PASSWORD
- JWT_SECRET
- JWT_EXPIRES_IN
- FRONTEND_URL

### Running the Application Locally

1. Install backend dependencies using npm install.
2. Configure environment variables.
3. Run database migrations and seed scripts.
4. Start the backend server.
5. Install frontend dependencies and start the frontend application.

### Running with Docker

The entire application can be started using a single command:

docker-compose up -d

This command starts the database, backend, and frontend services and automatically initializes the database.
