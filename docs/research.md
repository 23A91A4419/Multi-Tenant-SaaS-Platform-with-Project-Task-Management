# Multi-Tenant SaaS Platform - Research & Analysis

## 1. Multi-Tenancy Architecture Analysis

Multi-tenancy is a software architecture where a single instance of software serves multiple tenants. A tenant is a group of users who share a common access with specific privileges to the software instance. In our case, each "organization" is a tenant.

There are three primary approaches to implementing multi-tenancy in a database:

### A. Shared Database, Shared Schema (Tenant ID Column)
All tenants share the same database and the same schema. A `tenant_id` column in every table associates each record with a specific tenant.

**Pros:**
*   **Cost Effective:** Lowest infrastructure cost as resources are shared.
*   **Scalability:** Supports a large number of tenants on a single database instance.
*   **Easy Maintenance:** Schema updates are applied once for all tenants.
*   **Simplified Backup:** Single backup process for the entire system.

**Cons:**
*   **Data Isolation Risk:** Relying on application logic (<code>WHERE tenant_id = ?</code>) is prone to developer error. A bug in a query can expose one tenant's data to another.
*   **"Noisy Neighbor" Effect:** One heavy tenant can degrade performance for everyone.
*   **Backup/Restore Granularity:** Restoring a single tenant's data is difficult without affecting others.

### B. Shared Database, Separate Schema
All tenants share the same database, but each tenant has its own schema (namespace).

**Pros:**
*   **Better Isolation:** Data is logically separated at the database level.
*   **Granular Restoration:** Easier to backup and restore individual schemas.
*   **Customization:** Valid scenarios where different tenants might need slightly different table structures (though rare in standardized SaaS).

**Cons:**
*   **Schema Migration Complexity:** Migrations must be run against every schema, which can be slow and error-prone.
*   **Resource Overhead:** Limits on the number of schemas per database can be a bottleneck.
*   **Connection Pooling:** Can be challenging to manage connections effectively across many schemas.

### C. Separate Database per Tenant
Each tenant has their own dedicated database instance.

**Pros:**
*   **Maximum Isolation:** Physical separation of data provides the highest security.
*   **Performance:** Resources can be allocated specifically to high-value tenants. No "noisy neighbor" effect.
*   **Security:** Compromise of one database does not affect others.

**Cons:**
*   **Highest Cost:** Significant infrastructure overhead.
*   **Maintenance Nightmare:** Managing upgrades, backups, and monitoring for thousands of databases is operationally complex.
*   **Aggregation:** Reporting across tenants is difficult.

### Comparison Table

| Feature | Shared Schema | Separate Schema | Separate Database |
| :--- | :--- | :--- | :--- |
| **Isolation** | Low (Application Level) | Medium (Logical Level) | High (Physical Level) |
| **Cost** | Low | Medium | High |
| **Scalability (Tenants)** | High | Medium | Low (per instance) |
| **Complexity** | Low | Medium | High |
| **Maintenance** | Easy | Moderate | Difficult |

### Chosen Approach: Shared Database with Shared Schema
For this project, we have selected the **Shared Database with Shared Schema** approach.

**Justification:**
1.  **Simplicity:** As a learning project and a scalable SaaS MVP, simplicity in deployment and management is prioritized.
2.  **Resource Efficiency:** It allows us to host many tenants on a modest infrastructure (single Docker container), fitting the project constraints.
3.  **Development Speed:** We can leverage standard ORM patterns and migration tools without complex schema routing logic.
4.  **Mitigation of Risks:** We mitigate the isolation risk by using strict middleware that injects `tenant_id` into contexts and wrapper functions for database access, ensuring no query goes without a filter.

---

## 2. Technology Stack Justification

### Backend: Node.js & Express
*   **Why:** Node.js offers a non-blocking, event-driven architecture ideal for I/O-heavy applications like this SaaS platform. Its vast ecosystem (npm) speeds up development. Express is the de-facto standard framework, offering robust routing and middleware support which is crucial for our multi-tenant request handling.
*   **Alternatives:** Python/Django (good, but less performant for high concurrency without tuning), Go (excellent performance, but steeper learning curve).

### Frontend: React
*   **Why:** React's component-based architecture makes building complex, interactive UIs manageable. Its Virtual DOM ensures high performance. The "Create React App" or "Vite" tooling provides a production-ready build pipeline out of the box.
*   **Alternatives:** Vue.js (simpler, but React has larger market share), Angular (too opinionated for this scope).

### Database: PostgreSQL
*   **Why:** PostgreSQL is the most advanced open-source relational database. It offers robust support for JSON types (useful for flexible tenant configurations), strong ACID compliance, and excellent performance. Its support for Row Level Security (RLS) offers a potential future upgrade path for even stronger isolation.
*   **Alternatives:** MySQL (good, but Postgres has better feature set for complex queries), MongoDB (NoSQL, not ideal for structured relational data like users/projects/tasks).

### Containerization: Docker & Docker Compose
*   **Why:** Mandatory requirement, but also essential for replicating the production environment locally. Docker Compose allows us to orchestrate the API, Database, and Frontend as a single unit, simplifying the "one command start" experience.

### Authentication: JWT (JSON Web Tokens)
*   **Why:** Stateless authentication scales horizontally. We don't need to store session data in Redis or the DB, reducing lookup latency. Tokens can carry claims (like `tenant_id` and `role`), allowing the backend to make authorization decisions instantly without extra DB queries.

---

## 3. Security Considerations for Multi-Tenancy

### 1. Strict Data Isolation
The most critical security aspect. We enforce this by:
*   **Middleware Enforcement:** A middleware extracts `tenant_id` from the JWT and attaches it to the request object.
*   **Query Scoping:** All database queries MUST include `WHERE tenant_id = ?`. We avoid "global" queries unless initiated by a Super Admin.
*   **Foreign Key Constraints:** The database schema enforces `tenant_id` on all sensitive tables (`projects`, `tasks`), preventing orphaned data or cross-tenant contamination.

### 2. Authentication & Session Management
*   **JWT Storage:** We use short-lived access tokens (24h) to minimize the window of opportunity if a token is compromised.
*   **Hashing:** Passwords are hashed using `bcrypt` with a work factor of 10, ensuring that even if the DB is dumped, passwords remain secure.
*   **Tenant Context:** The `tenant_id` is embedded in the token at login time. A user cannot switch tenants without re-authenticating (or obtaining a new token), preventing "tenant hopping".

### 3. Role-Based Access Control (RBAC)
*   **Granular Permissions:** We distinguish between `Super Admin` (system management), `Tenant Admin` (organization management), and `User` (task execution).
*   **Middleware Guards:** Routes are protected by middleware that checks `req.user.role`. For example, only `tenant_admin` can add users to a tenant.

### 4. Input Validation & Sanitization
*   **Validation:** All incoming data (registration forms, project details) is validated for type and content to prevent injection attacks.
*   **Subdomain Security:** Tenant subdomains are validated to ensure they are URL-safe and do not conflict with reserved words.

### 5. API Security
*   **HTTP Status Codes:** We use correct codes (401 vs 403 vs 404) to avoid leaking information about existence of resources to unauthorized users.
*   **Error Handling:** Generic error messages are returned to the client in production, while detailed logs are kept server-side to prevent stack trace leakage.