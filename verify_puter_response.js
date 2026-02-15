const puter = require('@heyputer/puter.js').default;

async function verifyPuter() {
    console.log('Starting Puter.js simple chat test...');
    try {
        const messages = [{ role: 'user', content: 'Hello, testing connection.' }];
        console.log('Sending message:', messages);

        const response = await puter.ai.chat(messages, {
            model: 'gpt-4o-mini'
        });

        console.log('Puter.js RAW Response:', JSON.stringify(response, null, 2));

        if (response && response.message && response.message.content) {
            console.log('Structure is correct: response.message.content found.');
        } else {
            console.log('Structure might be different. Checking keys:', Object.keys(response));
            if (Array.isArray(response)) {
                console.log('Response is an array.');
            }
        }

    } catch (error) {
        console.error('Puter.js Test Error:', error);
    }
}

verifyPuter();
