-- TENANT
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Demo Company',
  'demo',
  'active',
  'pro',
  25,
  15
);

-- SUPER ADMIN (password: Admin@123)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  NULL,
  'superadmin@system.com',
  '$2b$10$jbyl7qUGLJF.n2guLnPy8.jmZbtkaFPtnqd3dijrprZd.9QrvmdFS',
  'System Admin',
  'super_admin'
);

-- TENANT ADMIN (password: Demo@123)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'admin@demo.com',
  '$2b$10$zvNFacNg1dhYNRbRU.q8jOkUum8lp2uIvpV0lzQpSK679upsXNO7W',
  'Demo Admin',
  'tenant_admin'
);

-- USER 1 (password: User@123)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'user1@demo.com',
  '$2b$10$D2YLAKASixyPhXp9fzo4su78yh/ffjGPVYdSTGyz7Nq3oKYjyOrBO',
  'Demo User One',
  'user'
);

-- USER 2 (password: User@123)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  'user2@demo.com',
  '$2b$10$D2YLAKASixyPhXp9fzo4su78yh/ffjGPVYdSTGyz7Nq3oKYjyOrBO',
  'Demo User Two',
  'user'
);

-- PROJECTS
INSERT INTO projects (id, tenant_id, name, description, created_by)
VALUES
(
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'Project Alpha',
  'First demo project',
  '33333333-3333-3333-3333-333333333333'
),
(
  '77777777-7777-7777-7777-777777777777',
  '22222222-2222-2222-2222-222222222222',
  'Project Beta',
  'Second demo project',
  '33333333-3333-3333-3333-333333333333'
);

-- TASKS (5 tasks across 2 projects)
INSERT INTO tasks (id, project_id, tenant_id, title, status, priority)
VALUES
(
  '88888888-8888-8888-8888-888888888888',
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'Initial planning',
  'todo',
  'high'
),
(
  '88888888-8888-8888-8888-888888888889',
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222',
  'Design phase',
  'in_progress',
  'medium'
),
(
  '88888888-8888-8888-8888-888888888890',
  '77777777-7777-7777-7777-777777777777',
  '22222222-2222-2222-2222-222222222222',
  'Development work',
  'todo',
  'high'
),
(
  '88888888-8888-8888-8888-888888888891',
  '77777777-7777-7777-7777-777777777777',
  '22222222-2222-2222-2222-222222222222',
  'Testing',
  'todo',
  'low'
),
(
  '88888888-8888-8888-8888-888888888892',
  '77777777-7777-7777-7777-777777777777',
  '22222222-2222-2222-2222-222222222222',
  'Deployment',
  'todo',
  'medium'
);
