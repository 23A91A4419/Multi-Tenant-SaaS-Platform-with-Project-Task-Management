
const axios = require('axios');

async function test(name, payload) {
    try {
        console.log(`--- Testing: ${name} ---`);
        const res = await axios.post('http://localhost:5000/api/auth/login', payload);
        console.log('Success:', res.data.success); // Should be true
    } catch (err) {
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Message:', err.response.data.message);
        } else {
            console.log('Error:', err.message);
        }
    }
}

async function run() {
    await test('Whitespace Email', {
        email: 'admin@demo.com ',
        password: 'Demo@123',
        tenantSubdomain: 'demo'
    });

    await test('Whitespace Subdomain', {
        email: 'admin@demo.com',
        password: 'Demo@123',
        tenantSubdomain: 'demo '
    });
}

run();
