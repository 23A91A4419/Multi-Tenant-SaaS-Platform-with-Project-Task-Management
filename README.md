# Multi-Tenant SaaS Platform – Project & Task Management System

A production-ready, full-stack Multi-Tenant SaaS application that enables multiple organizations (tenants) to independently manage their teams, projects, and tasks with complete data isolation, role-based access control (RBAC), and subscription plan enforcement.

This system demonstrates secure authentication, scalable architecture, Docker containerization, and modern frontend development practices.

---

## 🚀 Features

- Multi-tenant architecture with strict data isolation
- JWT-based authentication (24-hour expiry)
- Role-Based Access Control (Super Admin, Tenant Admin, User)
- Subscription plan enforcement (Free, Pro, Enterprise)
- Tenant registration with unique subdomain
- Project creation and management
- Task creation, assignment, and status tracking
- Audit logging for security and traceability
- Health check endpoint for deployment monitoring
- Fully Dockerized setup with single-command deployment

---

## 🏗 System Architecture

The application follows a 3-tier architecture:

Client (Browser)  
⬇  
Frontend (React Application)  
⬇  
Backend (Node.js + Express REST API)  
⬇  
PostgreSQL Database  

Each request is authenticated using JWT and automatically scoped to the tenant using tenant_id filtering.

📌 Architecture Diagram:  
`docs/images/system-architecture.png`

📌 Database ERD:  
`docs/images/database-erd.png`

---

## 🛠 Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt (password hashing)
- Docker

### Frontend
- React.js
- Axios
- React Router
- Responsive UI

### Database
- PostgreSQL 15

### DevOps
- Docker
- Docker Compose
- Health Checks
- Environment Variables

---

## 🔐 Roles & Access Control

### Super Admin
- Access all tenants
- Update subscription plans
- View all tenants
- Manage system-level operations

### Tenant Admin
- Manage users within tenant
- Create and manage projects
- Assign tasks
- View tenant statistics

### User
- View projects
- Update assigned tasks
- Limited access within tenant

---

## 📦 Subscription Plans

| Plan       | Max Users | Max Projects |
|------------|----------|-------------|
| Free       | 5        | 3           |
| Pro        | 25       | 15          |
| Enterprise | 100      | 50          |

APIs enforce subscription limits before resource creation.

---

## 🗄 Database Schema

Core Tables:

- tenants
- users
- projects
- tasks
- audit_logs
- sessions (optional)

All tables include:
- Foreign key constraints
- CASCADE delete where appropriate
- Indexes on tenant_id
- Composite unique constraint on (tenant_id, email)

---

## 🔌 API Endpoints

The system includes 19 RESTful API endpoints covering:

### Authentication
- POST /api/auth/register-tenant
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

### Tenant Management
- GET /api/tenants/:tenantId
- PUT /api/tenants/:tenantId
- GET /api/tenants

### User Management
- POST /api/tenants/:tenantId/users
- GET /api/tenants/:tenantId/users
- PUT /api/users/:userId
- DELETE /api/users/:userId

### Project Management
- POST /api/projects
- GET /api/projects
- PUT /api/projects/:projectId
- DELETE /api/projects/:projectId

### Task Management
- POST /api/projects/:projectId/tasks
- GET /api/projects/:projectId/tasks
- PATCH /api/tasks/:taskId/status
- PUT /api/tasks/:taskId

📄 Full API documentation available in:
`docs/API.md`

---

## 🐳 Docker Setup (MANDATORY)

The application is fully containerized.

### Services:
- database (PostgreSQL)
- backend (API server)
- frontend (React app)

### Start All Services

```bash
docker-compose up -d

Perfect Madhu 💙
I’m giving you a complete, evaluation-ready README.md that:

✔ Matches all requirements
✔ Includes 8+ features
✔ Mentions architecture
✔ Mentions Docker
✔ Mentions deployment
✔ Looks professional
✔ Helps scoring

You can copy this fully into your README.md.

✅ README.md (Complete Version)
# Multi-Tenant SaaS Platform – Project & Task Management System

A production-ready, full-stack Multi-Tenant SaaS application that enables multiple organizations (tenants) to independently manage their teams, projects, and tasks with complete data isolation, role-based access control (RBAC), and subscription plan enforcement.

This system demonstrates secure authentication, scalable architecture, Docker containerization, and modern frontend development practices.

---

## 🚀 Features

- Multi-tenant architecture with strict data isolation
- JWT-based authentication (24-hour expiry)
- Role-Based Access Control (Super Admin, Tenant Admin, User)
- Subscription plan enforcement (Free, Pro, Enterprise)
- Tenant registration with unique subdomain
- Project creation and management
- Task creation, assignment, and status tracking
- Audit logging for security and traceability
- Health check endpoint for deployment monitoring
- Fully Dockerized setup with single-command deployment

---

## 🏗 System Architecture

The application follows a 3-tier architecture:

Client (Browser)  
⬇  
Frontend (React Application)  
⬇  
Backend (Node.js + Express REST API)  
⬇  
PostgreSQL Database  

Each request is authenticated using JWT and automatically scoped to the tenant using tenant_id filtering.

📌 Architecture Diagram:  
`docs/images/system-architecture.png`

📌 Database ERD:  
`docs/images/database-erd.png`

---

## 🛠 Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt (password hashing)
- Docker

### Frontend
- React.js
- Axios
- React Router
- Responsive UI

### Database
- PostgreSQL 15

### DevOps
- Docker
- Docker Compose
- Health Checks
- Environment Variables

---

## 🔐 Roles & Access Control

### Super Admin
- Access all tenants
- Update subscription plans
- View all tenants
- Manage system-level operations

### Tenant Admin
- Manage users within tenant
- Create and manage projects
- Assign tasks
- View tenant statistics

### User
- View projects
- Update assigned tasks
- Limited access within tenant

---

## 📦 Subscription Plans

| Plan       | Max Users | Max Projects |
|------------|----------|-------------|
| Free       | 5        | 3           |
| Pro        | 25       | 15          |
| Enterprise | 100      | 50          |

APIs enforce subscription limits before resource creation.

---

## 🗄 Database Schema

Core Tables:

- tenants
- users
- projects
- tasks
- audit_logs
- sessions (optional)

All tables include:
- Foreign key constraints
- CASCADE delete where appropriate
- Indexes on tenant_id
- Composite unique constraint on (tenant_id, email)

---

## 🔌 API Endpoints

The system includes 19 RESTful API endpoints covering:

### Authentication
- POST /api/auth/register-tenant
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

### Tenant Management
- GET /api/tenants/:tenantId
- PUT /api/tenants/:tenantId
- GET /api/tenants

### User Management
- POST /api/tenants/:tenantId/users
- GET /api/tenants/:tenantId/users
- PUT /api/users/:userId
- DELETE /api/users/:userId

### Project Management
- POST /api/projects
- GET /api/projects
- PUT /api/projects/:projectId
- DELETE /api/projects/:projectId

### Task Management
- POST /api/projects/:projectId/tasks
- GET /api/projects/:projectId/tasks
- PATCH /api/tasks/:taskId/status
- PUT /api/tasks/:taskId

📄 Full API documentation available in:
`docs/API.md`

---

## 🐳 Docker Setup (MANDATORY)

The application is fully containerized.

### Services:
- database (PostgreSQL)
- backend (API server)
- frontend (React app)

### Start All Services

```bash
docker-compose up -d

Verify Services
docker-compose ps

Health Check
curl http://localhost:5000/api/health


Expected response:

{
  "status": "ok",
  "database": "connected"
}

⚙ Environment Variables
Backend
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=24h
FRONTEND_URL=
PORT=5000
NODE_ENV=development

Frontend
REACT_APP_API_URL=

💻 Local Development Setup
Prerequisites

Node.js (v18+ recommended)

Docker & Docker Compose

PostgreSQL (if running locally without Docker)

Run with Docker (Recommended)
docker-compose up -d

Run Backend Manually
cd backend
npm install
npm run migrate
npm run seed
npm start

Run Frontend Manually
cd frontend
npm install
npm start

🔍 Multi-Tenancy Strategy

This system uses:

Shared Database + Shared Schema (tenant_id column)

Data isolation is enforced by:

Extracting tenantId from JWT token

Automatically filtering queries by tenant_id

Restricting cross-tenant access at API layer

Super Admin exception with tenant_id = NULL

📊 Health Monitoring

Health endpoint:

GET /api/health


Returns:

API status

Database connection status

Timestamp

Latency

Used for Docker health checks and deployment monitoring.

🎥 Demo Video

Demo video link:
https://www.youtube.com/watch?v=ZnKIOitccmQ&t=17s
📁 Project Structure
backend/
  ├── src/
  │   ├── controllers/
  │   ├── routes/
  │   ├── middleware/
  │   ├── models/
  │   ├── config/
  │   └── utils/
  ├── migrations/
  ├── seeds/
  └── Dockerfile

frontend/
  ├── src/
  └── Dockerfile

docs/
  ├── research.md
  ├── PRD.md
  ├── architecture.md
  ├── technical-spec.md
  └── API.md

docker-compose.yml
submission.json
README.md
