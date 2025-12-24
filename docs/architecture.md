# System Architecture
## System Architecture Diagram
The system follows a typical three-tier architecture consisting of a frontend, backend, and database.

Users interact with the system through a web browser. The browser communicates with the frontend application, which is responsible for rendering the user interface and handling user interactions.

The frontend sends API requests to the backend server. The backend handles authentication, authorization, business logic, and data validation. JWT tokens are used to authenticate requests and identify the tenant and user role.

The backend communicates with the PostgreSQL database to store and retrieve data. All tenant-specific data is isolated using a tenant_id column in the database tables.

The backend exposes a health check endpoint to verify system readiness and database connectivity.
## Database Design
The database is designed using a shared schema multi-tenancy approach. All tenants share the same database and tables, while data isolation is enforced using a tenant_id column.

The main tables in the database are:

- tenants: Stores organization details such as name, subdomain, status, and subscription plan.
- users: Stores user accounts associated with tenants and roles such as super_admin, tenant_admin, and user.
- projects: Stores projects created under a tenant.
- tasks: Stores tasks associated with projects and assigned users.
- audit_logs: Stores records of important actions performed in the system.

Foreign key relationships are used to maintain referential integrity between tables. Indexes are added on tenant_id columns to improve query performance.
## API Architecture
Authentication APIs:
- POST /api/auth/register-tenant
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

Tenant Management APIs:
- GET /api/tenants/:tenantId
- PUT /api/tenants/:tenantId
- GET /api/tenants

User Management APIs:
- POST /api/tenants/:tenantId/users
- GET /api/tenants/:tenantId/users
- PUT /api/users/:userId
- DELETE /api/users/:userId

Project Management APIs:
- POST /api/projects
- GET /api/projects
- PUT /api/projects/:projectId
- DELETE /api/projects/:projectId

Task Management APIs:
- POST /api/projects/:projectId/tasks
- GET /api/projects/:projectId/tasks
- PATCH /api/tasks/:taskId/status
- PUT /api/tasks/:taskId
