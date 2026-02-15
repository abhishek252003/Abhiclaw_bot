const prisma = require('../prisma');

exports.createAssistant = async (req, res) => {
    try {
        const { name, systemPrompt, model } = req.body;
        const userId = req.userData.userId;

        const assistant = await prisma.assistant.create({
            data: {
                name,
                systemPrompt,
                model: model || 'gpt-4o-mini',
                userId,
            },
        });

        res.status(201).json(assistant);
    } catch (error) {
        console.error('Create assistant error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAssistants = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const assistants = await prisma.assistant.findMany({
            where: { userId },
        });
        res.json(assistants);
    } catch (error) {
        console.error('Get assistants error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAssistantById = async (req, res) => {
    try {
        const { id } = req.params;
        const assistant = await prisma.assistant.findUnique({
            where: { id },
        });

        if (!assistant) {
            return res.status(404).json({ message: 'Assistant not found' });
        }

        res.json(assistant);
    } catch (error) {
        console.error('Get assistant by id error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateAssistant = async (req, res) => {
    // Add update logic if needed
    res.status(501).json({ message: "Not implemented yet" });
}

exports.deleteAssistant = async (req, res) => {
    // Add delete logic if needed
    res.status(501).json({ message: "Not implemented yet" });
}
