const bcrypt = require('bcrypt');

const password = 'Demo@123';
const hash = '$2b$10$zvNFacNg1dhYNRbRU.q8jOkUum8lp2uIvpV0lzQpSK679upsXNO7W';

bcrypt.compare(password, hash).then(res => {
    console.log('Does Demo@123 match the hash?', res);
});

const passwordUser = 'User@123';
const hashUser = '$2b$10$D2YLAKASixyPhXp9fzo4su78yh/ffjGPVYdSTGyz7Nq3oKYjyOrBO';
bcrypt.compare(passwordUser, hashUser).then(res => {
    console.log('Does User@123 match the hash?', res);
});

const passwordAdmin = 'Admin@123';
const hashAdmin = '$2b$10$jbyl7qUGLJF.n2guLnPy8.jmZbtkaFPtnqd3dijrprZd.9QrvmdFS';
bcrypt.compare(passwordAdmin, hashAdmin).then(res => {
    console.log('Does Admin@123 match the hash?', res);
});
