
const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@demo.com',
            password: 'Demo@123',
            tenantSubdomain: 'demo'
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log('Error Data:', err.response?.data);
    }
}

testLogin();
