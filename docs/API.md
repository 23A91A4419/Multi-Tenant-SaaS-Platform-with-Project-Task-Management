
# API Documentation – Multi-Tenant SaaS Platform

Base URL (Docker):
http://backend:5000/api

Base URL (Local):
http://localhost:5000/api

All API responses follow this standard format:

Success:
{
  "success": true,
  "message": "optional message",
  "data": { }
}

Error:
{
  "success": false,
  "message": "Error description"
}


Authentication:
All protected APIs require:
Authorization: Bearer <JWT_TOKEN>

---------------------------------------------------------------------

## AUTHENTICATION APIs

### API 1: Register Tenant
POST /auth/register-tenant  
Auth: Public  

Request Body:
{
  "tenantName": "Test Company",
  "subdomain": "testcompany",
  "adminEmail": "admin@test.com",
  "adminPassword": "Test@1234",
  "adminFullName": "Admin User"
}

Response (201):
Creates tenant and tenant_admin in a single transaction.

---------------------------------------------------------------------

### API 2: Login
POST /auth/login  
Auth: Public  

Request Body:
{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}

Response (200):
Returns JWT token with 24h expiry.

---------------------------------------------------------------------

### API 3: Get Current User
GET /auth/me  
Auth: Required  

Response:
Returns logged-in user details and tenant info.

---------------------------------------------------------------------

### API 4: Logout
POST /auth/logout  
Auth: Required  

Response:
JWT-only logout (client removes token).

---------------------------------------------------------------------

## TENANT MANAGEMENT APIs

### API 5: Get Tenant Details
GET /tenants/:tenantId  
Auth: Required  
Role: tenant_admin (own tenant) or super_admin  

Response:
Returns tenant info and statistics.

---------------------------------------------------------------------

### API 6: Update Tenant
PUT /tenants/:tenantId  
Auth: Required  

Permissions:
• tenant_admin → can update name only  
• super_admin → can update all fields  

---------------------------------------------------------------------

### API 7: List All Tenants
GET /tenants  
Auth: Required  
Role: super_admin only  

Query Params:
page, limit, status, subscriptionPlan

---------------------------------------------------------------------

## USER MANAGEMENT APIs

### API 8: Add User
POST /tenants/:tenantId/users  
Auth: Required  
Role: tenant_admin  

Checks subscription user limit before creation.

---------------------------------------------------------------------

### API 9: List Users
GET /tenants/:tenantId/users  
Auth: Required  

Query Params:
search, role, page, limit

---------------------------------------------------------------------

### API 10: Update User
PUT /users/:userId  
Auth: Required  

Permissions:
• user → update own name  
• tenant_admin → update role & status  

---------------------------------------------------------------------

### API 11: Delete User
DELETE /users/:userId  
Auth: Required  
Role: tenant_admin  

Tenant admin cannot delete themselves.

---------------------------------------------------------------------

## PROJECT MANAGEMENT APIs

### API 12: Create Project
POST /projects  
Auth: Required  

Checks project subscription limit.

---------------------------------------------------------------------

### API 13: List Projects
GET /projects  
Auth: Required  

Query Params:
status, search, page, limit

---------------------------------------------------------------------

### API 14: Update Project
PUT /projects/:projectId  
Auth: Required  
Role: tenant_admin or project creator  

---------------------------------------------------------------------

### API 15: Delete Project
DELETE /projects/:projectId  
Auth: Required  
Role: tenant_admin or project creator  

---------------------------------------------------------------------

## TASK MANAGEMENT APIs

### API 16: Create Task
POST /projects/:projectId/tasks  
Auth: Required  

Tenant ID is derived from project, not JWT.

---------------------------------------------------------------------

### API 17: List Project Tasks
GET /projects/:projectId/tasks  
Auth: Required  

Query Params:
status, assignedTo, priority, search, page, limit

---------------------------------------------------------------------

### API 18: Update Task Status
PATCH /tasks/:taskId/status  
Auth: Required  

Request Body:
{
  "status": "completed"
}

---------------------------------------------------------------------

### API 19: Update Task
PUT /tasks/:taskId  
Auth: Required  

Allows partial update of task fields.

---------------------------------------------------------------------

## HEALTH CHECK API

### API 20: Health Check
GET /health  
Auth: Public  

Response:
{
  "status": "ok",
  "database": "connected"
}

Used by Docker health check and evaluation script.

---------------------------------------------------------------------

END OF API DOCUMENTATION
