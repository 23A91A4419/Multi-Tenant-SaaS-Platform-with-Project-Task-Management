# API Documentation

This document describes the 19 API endpoints of the Multi-Tenant SaaS Platform.

## Base URL
`http://localhost:5000/api`

## Authentication

### 1. Register Tenant
**Endpoint:** `POST /auth/register-tenant`
**Description:** Creates a new tenant organization and its first admin user.
**Request Body:**
```json
{
  "tenantName": "Acme Corp",
  "subdomain": "acme",
  "adminEmail": "admin@acme.com",
  "adminPassword": "SecurePassword123!",
  "adminFullName": "John Doe"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid...",
    "subdomain": "acme",
    "adminUser": { "id": "uuid...", "email": "admin@acme.com", "role": "tenant_admin" }
  }
}
```

### 2. Login
**Endpoint:** `POST /auth/login`
**Description:** Authenticates a user and returns a JWT token.
**Request Body:**
```json
{
  "email": "user@acme.com",
  "password": "Password123",
  "tenantSubdomain": "acme"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "role": "user" },
    "token": "jwt_token_string",
    "expiresIn": 86400
  }
}
```

### 3. Get Current User / Verify Token
**Endpoint:** `GET /auth/me`
**Headers:** `Authorization: Bearer <token>`
**Description:** Returns details of the currently authenticated user.
**Response (200 OK):**
```json
{
  "success": true,
  "data": { "id": "...", "email": "...", "role": "...", "tenant": { ... } }
}
```

### 4. Logout
**Endpoint:** `POST /auth/logout`
**Headers:** `Authorization: Bearer <token>`
**Description:** Logs out the user (client-side token removal).
**Response (200 OK):**
```json
{ "success": true, "message": "Logged out successfully" }
```

## Tenant Management

### 5. Get Tenant Details
**Endpoint:** `GET /tenants/:tenantId`
**Headers:** `Authorization: Bearer <token>` (Tenant Admin/Super Admin)
**Description:** Returns details of a specific tenant including stats.
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "...", "name": "Acme Corp", "stats": { "totalUsers": 10, "totalProjects": 5 }
  }
}
```

### 6. Update Tenant
**Endpoint:** `PUT /tenants/:tenantId`
**Headers:** `Authorization: Bearer <token>` (Tenant Admin/Super Admin)
**Request Body:**
```json
{ "name": "Acme Corporation Inc." }
```
**Response (200 OK):**
```json
{ "success": true, "data": { "id": "...", "name": "Acme Corporation Inc." } }
```

### 7. List All Tenants (Super Admin)
**Endpoint:** `GET /tenants`
**Headers:** `Authorization: Bearer <token>` (Super Admin Only)
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tenants": [ { "id": "...", "name": "...", "subdomain": "..." } ],
    "pagination": { "total": 50, "page": 1 }
  }
}
```

## User Management

### 8. Add User to Tenant
**Endpoint:** `POST /tenants/:tenantId/users`
**Headers:** `Authorization: Bearer <token>` (Tenant Admin)
**Request Body:**
```json
{
  "email": "jane@acme.com", "password": "Password123", "fullName": "Jane Doe", "role": "user"
}
```
**Response (201 Created):**
```json
{ "success": true, "data": { "id": "...", "email": "jane@acme.com" } }
```

### 9. List Tenant Users
**Endpoint:** `GET /tenants/:tenantId/users`
**Headers:** `Authorization: Bearer <token>`
**Response (200 OK):**
```json
{
  "success": true,
  "data": { "users": [ ... ], "total": 15 }
}
```

### 10. Update User
**Endpoint:** `PUT /users/:userId`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{ "fullName": "Jane Smith" }
```
**Response (200 OK):**
```json
{ "success": true, "data": { "id": "...", "fullName": "Jane Smith" } }
```

### 11. Delete User
**Endpoint:** `DELETE /users/:userId`
**Headers:** `Authorization: Bearer <token>` (Tenant Admin)
**Response (200 OK):**
```json
{ "success": true, "message": "User deleted successfully" }
```

## Project Management

### 12. Create Project
**Endpoint:** `POST /projects`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "name": "Website Redesign",
  "description": "Revamp company website Q1",
  "status": "active"
}
```
**Response (201 Created):**
```json
{ "success": true, "data": { "id": "...", "name": "Website Redesign" } }
```

### 13. List Projects
**Endpoint:** `GET /projects`
**Headers:** `Authorization: Bearer <token>`
**Response (200 OK):**
```json
{ "success": true, "data": { "projects": [ ... ] } }
```

### 14. Update Project
**Endpoint:** `PUT /projects/:projectId`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{ "status": "completed" }
```
**Response (200 OK):**
```json
{ "success": true, "data": { "id": "...", "status": "completed" } }
```

### 15. Delete Project
**Endpoint:** `DELETE /projects/:projectId`
**Headers:** `Authorization: Bearer <token>`
**Response (200 OK):**
```json
{ "success": true, "message": "Project deleted successfully" }
```

## Task Management

### 16. Create Task
**Endpoint:** `POST /projects/:projectId/tasks`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "title": "Design Mockups",
  "priority": "high",
  "assignedTo": "user_uuid",
  "dueDate": "2024-12-31"
}
```
**Response (201 Created):**
```json
{ "success": true, "data": { "id": "...", "title": "Design Mockups" } }
```

### 17. List Tasks
**Endpoint:** `GET /projects/:projectId/tasks`
**Headers:** `Authorization: Bearer <token>`
**Response (200 OK):**
```json
{ "success": true, "data": { "tasks": [ ... ] } }
```

### 18. Update Task Status
**Endpoint:** `PATCH /tasks/:taskId/status`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{ "status": "in_progress" }
```
**Response (200 OK):**
```json
{ "success": true, "data": { "id": "...", "status": "in_progress" } }
```

### 19. Update Task Details
**Endpoint:** `PUT /tasks/:taskId`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{ "title": "Updated Title", "priority": "medium" }
```
**Response (200 OK):**
```json
{ "success": true, "data": { "id": "...", "title": "Updated Title" } }
```
