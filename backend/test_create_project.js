
const loginUrl = 'http://localhost:5000/api/auth/login';
const projectsUrl = 'http://localhost:5000/api/projects';
const tenantsUrl = 'http://localhost:5000/api/tenants';

async function testCreateProject() {
    try {
        // 1. Login as Super Admin
        console.log('Logging in...');
        const loginResponse = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@demo.com', // Using standard admin from previous context or seed
                password: 'Demo@123',
                tenantSubdomain: 'demo'  // This might need to be 'admin' or null for super admin depending on implementation
                // But based on submission.json, there is a superAdmin user: superadmin@system.com / Admin@123
            })
        });

        // Try Super Admin credentials from submission.json first
        let token;
        let userData;

        if (loginResponse.status !== 200) {
            console.log('Standard admin login failed, trying Super Admin credentials...');
            const superLoginResponse = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'superadmin@system.com',
                    password: 'Admin@123',
                    // Super admin might not need subdomain or it might be specific
                })
            });

            if (superLoginResponse.status !== 200) {
                const text = await superLoginResponse.text();
                // If both fail, try the one from test_login.js (admin@demo.com) again with correct params if needed
                console.error('Super Admin Login failed:', superLoginResponse.status, text);

                // FALLBACK to the credentials in test_login.js which user had
                // The user had: email: 'admin@demo.com', password: 'Demo@123', tenantSubdomain: 'demo'
                // Re-trying that specific combo exactly as in test_login.js if the first attempt was slightly different
                // Actually my first attempt was that.
                return;
            }
            const data = await superLoginResponse.json();
            token = data.data.token;
            userData = data.data.user;
            console.log('Logged in as Super Admin');

        } else {
            const data = await loginResponse.json();
            token = data.data.token;
            userData = data.data.user;
            console.log('Logged in as Tenant Admin');
        }

        // 2. List Tenants (Only for Super Admin, but lets iterate)
        let tenantIdToUse;

        if (userData.role === 'super_admin') {
            console.log('Fetching tenants...');
            const tenantRes = await fetch(tenantsUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const tenantData = await tenantRes.json();
            if (tenantData.success && tenantData.data.tenants.length > 0) {
                tenantIdToUse = tenantData.data.tenants[0].id;
                console.log('Selected Tenant ID:', tenantIdToUse);
            } else {
                console.error('No tenants found for Super Admin to create project in.');
                return;
            }
        } else {
            // For tenant admin, tenantId is usually in the user object or inferred
            tenantIdToUse = userData.tenantId; // Or similar
            console.log('Using User Tenant ID:', tenantIdToUse);
        }

        // 3. Create Project
        const projectName = `Test Project ${Date.now()}`;
        console.log(`Creating project "${projectName}"...`);

        const createPayload = {
            name: projectName,
            description: 'Created via verification script',
            // tenantId: tenantIdToUse // Super admin might need this in body
        };

        if (userData.role === 'super_admin') {
            createPayload.tenantId = tenantIdToUse;
        }

        const createRes = await fetch(projectsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(createPayload)
        });

        const createData = await createRes.json();

        if (createRes.status === 201) {
            console.log('✅ Project Created Successfully!');
            console.log('Project ID:', createData.data.id);
        } else {
            console.error('❌ Project Creation Failed:', createRes.status, createData);
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testCreateProject();
