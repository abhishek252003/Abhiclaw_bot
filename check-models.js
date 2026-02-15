const puter = require('@heyputer/puter.js').default;
const dotenv = require('dotenv');
dotenv.config();

puter.setAuthToken(process.env.PUTER_TOKEN);

async function checkModels() {
    try {
        console.log('Fetching AI models...');
        // Puter.js doesn't always have a direct listModels call in some versions, 
        // but we can try a basic chat with a standard model to verify.
        const response = await puter.ai.chat([{ role: 'user', content: 'hi' }], { model: 'gpt-4o-mini' });
        console.log('Standard model response:', response);
    } catch (err) {
        console.error('Model test failed:', err);
    }
}

checkModels();
