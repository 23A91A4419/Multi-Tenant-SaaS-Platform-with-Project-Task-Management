📘 Multi-Tenant SaaS Platform

🧩 Project Description

Multi-Tenant SaaS Platform is a full-stack web application designed to support multiple organizations (tenants) within a single system. Each tenant operates in complete isolation while sharing a common infrastructure.

This project demonstrates real-world SaaS architecture using multi-tenancy, JWT authentication, role-based access control, and Dockerized deployment.

🎥 Demo Video
A complete walkthrough of the Multi-Tenant SaaS Platform, including features, architecture, and functionality, is available in the demo video below:

▶️ https://www.youtube.com/watch?v=ZnKIOitccmQ


🎯 Objective

Build a production-ready multi-tenant SaaS application

Ensure strict tenant data isolation

Implement secure authentication and authorization

Enforce subscription plan limits

Provide one-command Docker deployment

✨ Features

Multi-tenant architecture with tenant isolation

Tenant registration using unique subdomain

Role-based access control (Super Admin, Tenant Admin, User)

JWT-based authentication with 24-hour expiry

Automatic database migrations on startup

Automatic database seeding

User management per tenant

Project management per tenant

Task management with status and priority

Subscription plan enforcement

Fully Dockerized frontend, backend, and database

Backend health check endpoint

🛠 Technology Stack

Frontend
React 18
Vite
Axios
React Router DOM

Backend
Node.js 18
Express.js
JWT Authentication
bcrypt

Database
PostgreSQL 15

Containerization
Docker
Docker Compose

🏗 Architecture Overview

Browser
↓
Frontend (React)
↓
Backend (Node.js + Express)
↓
PostgreSQL Database

Tenant data isolation is enforced using tenant_id.
Super Admin users have tenant_id set to NULL.
All APIs are secured using JWT and role-based access control.

📁 Project Structure

database/
backend/
migrations/
seeds/
scripts/
src/
Dockerfile
.env

frontend/
src/
public/
Dockerfile
package.json

docs/
research.md
PRD.md
architecture.md
technical-spec.md
API.md
images/

docker-compose.yml
submission.json
README.md

⚙️ Installation & Setup

Prerequisites
Docker (v20+)
Docker Compose (v2+)
Git

🔐 Environment Variables

Backend Environment Variables

DB_HOST=database
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=dev_secret_key_min_32_chars
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://frontend:3000

Frontend Environment Variables

VITE_API_URL=http://backend:5000/api

🐳 Run Application with Docker

Build containers
docker compose build

Start application
docker compose up -d

Verify services
docker compose ps

🗄 Database Initialization

Database migrations run automatically when the backend starts.
Seed data is loaded automatically after migrations.
No manual database commands are required.

🌐 Application Access

Frontend: http://localhost:3000

Backend API: http://localhost:5000/api

Health Check: http://localhost:5000/api/health

❤️ Health Check

GET /api/health

Expected Response
status: ok
database: connected

🔑 Seed Data & Test Credentials

Super Admin
Email: superadmin@system.com

Password: Admin@123

Demo Tenant
Subdomain: demo

Tenant Admin
Email: admin@demo.com

Password: Demo@123

Users
user1@demo.com
 / User@123
user2@demo.com
 / User@123

All credentials are documented in submission.json.

📘 API Documentation

All 19 required APIs are documented in docs/API.md.

Modules Covered
Authentication
Tenant Management
User Management
Project Management
Task Management

