# Research Document
## Multi-Tenancy Architecture Analysis
### Shared Database with Shared Schema

In this approach, a single database is used for all tenants and all tenants share the same set of tables. Each table contains a tenant_id column which identifies the tenant to which a record belongs. This is the most commonly used approach in SaaS applications because it is simple to implement and cost effective.

The main advantage of this approach is scalability. Since all tenants use the same database structure, it is easy to add new tenants without creating new schemas or databases. Maintenance tasks such as backups, migrations, and monitoring are also simpler because there is only one database to manage.

The main disadvantage is the risk of data leakage if tenant filtering is not enforced properly. If developers forget to filter queries using tenant_id, one tenant may accidentally access another tenant’s data. Therefore, strict backend enforcement and testing are required.
### Shared Database with Separate Schema

In this approach, all tenants share the same database but each tenant has its own database schema. This provides better isolation compared to a shared schema because tables are separated at the schema level.

While this approach improves data isolation, it increases operational complexity. Database migrations become harder because changes must be applied to multiple schemas. Automation is also more complex when onboarding new tenants.

### Separate Database per Tenant

In this approach, each tenant has its own dedicated database. This provides the strongest level of data isolation and security because tenants are completely separated at the database level.

However, this approach is expensive and difficult to scale. Managing backups, migrations, and monitoring for many databases requires significant DevOps effort. For this reason, it is usually used only in high-security enterprise systems.
### Chosen Approach

This project uses a shared database with a shared schema and a tenant_id column for data isolation. This approach was chosen because it provides a good balance between scalability, cost efficiency, and simplicity. Strong data isolation is achieved by enforcing tenant_id filtering at the API and database query level.
## Technology Stack Justification
The backend of this system is built using Node.js and Express. Node.js was chosen because it supports asynchronous programming, which is suitable for handling multiple concurrent requests in a SaaS application.

The frontend is built using React. React allows building reusable UI components and makes it easy to implement role-based user interfaces.

PostgreSQL is used as the database because it provides strong ACID compliance, supports complex relationships, and enforces foreign key constraints, which are critical for maintaining data integrity in a multi-tenant system.

JWT is used for authentication because it is stateless and scalable. Tokens can be easily verified without maintaining server-side session state.

Docker and docker-compose are used to containerize the application. This ensures consistent environments and allows the entire system to be started using a single command.
## Security Considerations
Data isolation is enforced by associating every record with a tenant_id and filtering all database queries using the tenant_id obtained from the JWT token.

Authentication is implemented using JWT tokens with a fixed expiration time. This prevents long-lived tokens and reduces security risks.

Authorization is handled using role-based access control. Different API endpoints are restricted based on user roles such as super_admin, tenant_admin, and user.

Passwords are never stored in plain text. They are securely hashed using bcrypt before being stored in the database.

API security is enforced through input validation, proper HTTP status codes, and avoiding exposure of sensitive information in API responses.