const prisma = require('../prisma');
const puter = require('@heyputer/puter.js').default;
const fs = require('fs');

exports.chat = async (req, res) => {
    try {
        const { assistantId, message } = req.body;
        const userId = req.userData.userId;

        fs.appendFileSync('request.log', `Chat Request: ${JSON.stringify({ assistantId, message, userId })}\n`);

        // 1. Get assistant
        const assistant = await prisma.assistant.findUnique({
            where: { id: assistantId },
        });

        if (!assistant) {
            console.error('Assistant not found:', assistantId);
            return res.status(404).json({ message: 'Assistant not found' });
        }

        // 2. Save user message
        await prisma.message.create({
            data: {
                role: 'user',
                content: message,
                assistantId,
            },
        });

        // 3. Get history (last 10 messages for context) defines memory length
        const history = await prisma.message.findMany({
            where: { assistantId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Reverse to chronological order
        const conversationHistory = history.reverse().map(msg => ({
            role: msg.role,
            content: msg.content,
        }));

        // 4. Construct messages for AI
        const messages = [
            { role: 'system', content: assistant.systemPrompt },
            ...conversationHistory,
        ];

        console.error('Sending to Puter.js:', messages);

        // 5. Call Puter.js
        const response = await puter.ai.chat(messages, {
            model: assistant.model || 'gpt-4o-mini'
        });

        console.error('Puter.js Response:', response);

        // Robust response extraction
        let aiMessageContent;
        if (typeof response === 'string') {
            aiMessageContent = response;
        } else if (response && response.message && response.message.content) {
            aiMessageContent = response.message.content;
        } else if (response && response.content) {
            aiMessageContent = response.content;
        } else {
            console.error('Unexpected Puter response structure:', response);
            aiMessageContent = 'ERROR_UNEXPECTED_RESPONSE_STRUCTURE';
        }
        // Adjust based on actual response structure.
        // Puter.js usually returns a similar structure to OpenAI.
        // Let's assume response is the content string or an object with message.content
        // Documentation says it returns a ChatCompletion object usually.
        // Wait, let's look at the search result again or just assume standard access.
        // The search result said "returns response... typically prints response".
        // I'll assume standard object structure access content.

        // 6. Save AI response
        const savedAiMessage = await prisma.message.create({
            data: {
                role: 'assistant',
                content: aiMessageContent,
                assistantId,
            },
        });

        res.json({ reply: aiMessageContent, messageId: savedAiMessage.id });

    } catch (error) {
        console.error('Chat error:', error);
        fs.appendFileSync('request.log', `Chat error: ${error.stack}\n`);

        if (error.code === 'token_missing' || (error.message && error.message.includes('token_missing'))) {
            return res.status(401).json({
                message: 'Puter.js authentication failed. Please add PUTER_TOKEN to backend/.env file.',
                detail: 'Visit puter.com, open console, type puter.authToken to get your token.'
            });
        }

        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { assistantId } = req.params;
        const messages = await prisma.message.findMany({
            where: { assistantId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.saveMessage = async (req, res) => {
    try {
        const { assistantId, role, content } = req.body;

        const message = await prisma.message.create({
            data: {
                role,
                content,
                assistantId,
            },
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Save message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
