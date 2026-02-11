
const loginUrl = 'http://localhost:5000/api/auth/login';
const projectsUrl = 'http://localhost:5000/api/projects';

async function testCreateTask() {
    try {
        // 1. Login
        console.log('Logging in...');
        let loginResponse = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@demo.com',
                password: 'Demo@123',
                tenantSubdomain: 'demo'
            })
        });

        // Fallback to superadmin if needed (same logic as before)
        if (loginResponse.status !== 200) {
            loginResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'superadmin@system.com',
                    password: 'Admin@123'
                })
            });
        }

        if (loginResponse.status !== 200) {
            console.error('Login failed');
            return;
        }

        const loginData = await loginResponse.json();
        const token = loginData.data.token;
        const tenantId = loginData.data.user.tenantId || loginData.data.user.id; // approximate

        // 2. Create Project (to ensure we have a valid project ID)
        console.log('Creating Helper Project...');
        const projectRes = await fetch(projectsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: `Task Test Project ${Date.now()}`,
                description: 'Project for testing tasks',
                tenantId: loginData.data.user.role === 'super_admin' ? (await getTenantId(token)) : undefined
            })
        });

        if (projectRes.status !== 201) {
            console.error('Helper Project Creation Failed', await projectRes.text());
            return;
        }

        const projectData = await projectRes.json();
        const projectId = projectData.data.id;
        console.log('Helper Project Created:', projectId);

        // 3. Create Task
        const tasksUrl = `http://localhost:5000/api/projects/${projectId}/tasks`;
        console.log('Creating Task...');

        const taskPayload = {
            title: 'Verify Submission Task',
            description: 'This task confirms the API works',
            priority: 'high',
            dueDate: new Date(Date.now() + 86400000).toISOString()
        };

        const taskRes = await fetch(tasksUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskPayload)
        });

        const taskData = await taskRes.json();

        if (taskRes.status === 201) {
            console.log('✅ Task Created Successfully!');
            console.log('Task ID:', taskData.data.id);
            console.log('Task Title:', taskData.data.title);
        } else {
            console.error('❌ Task Creation Failed:', taskRes.status, taskData);
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
}

async function getTenantId(token) {
    const tenantsUrl = 'http://localhost:5000/api/tenants';
    const res = await fetch(tenantsUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    return data.data.tenants[0].id;
}

testCreateTask();
