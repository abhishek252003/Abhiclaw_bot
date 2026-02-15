const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testChat() {
    try {
        console.log('1. Registering user...');
        const email = `test_${Date.now()}@example.com`;
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password: 'password123'
        });

        const token = registerRes.data.token; // Changed from .token based on potential response structure? 
        // Wait, auth controller returns { message, userId } on register usually.
        // Let's check auth.controller.js...
        // Register returns: { message: 'User created successfully', userId: user.id }
        // Login returns: { token, userId }

        console.log('User registered. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: 'password123'
        });

        const authToken = loginRes.data.token;
        console.log('Logged in. Token:', authToken ? 'Received' : 'Missing');

        console.log('2. Creating Assistant...');
        const assistantRes = await axios.post(`${API_URL}/assistants`, {
            name: 'Test Bot',
            systemPrompt: 'You are a helpful assistant.',
            model: 'gpt-4o-mini'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const assistantId = assistantRes.data.id || assistantRes.data.assistant.id; // Check structure
        console.log('Assistant Created ID:', assistantId);

        console.log('3. Sending Chat Message...');
        const chatRes = await axios.post(`${API_URL}/chat`, {
            assistantId,
            message: 'Hello, are you working?'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log('Chat Response:', chatRes.data);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 500) {
            console.log('CAUGHT 500 ERROR - Check Backend Logs!');
        }
    }
}

testChat();
