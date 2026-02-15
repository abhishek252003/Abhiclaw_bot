const { Telegraf, Markup } = require('telegraf');
const puter = require('@heyputer/puter.js').default;
const prisma = require('../prisma');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Simple in-memory storage for user model preferences
const userModels = new Map();

const AVAILABLE_MODELS = [
    { name: 'GPT-4o', id: 'gpt-4o' },
    { name: 'GPT-4o Mini', id: 'gpt-4o-mini' },
    { name: 'o1-preview', id: 'o1-preview' },
    { name: 'o1-mini', id: 'o1-mini' },
    { name: 'Claude 3.5 Sonnet', id: 'claude-3-5-sonnet-20240620' },
    { name: 'Llama 3.1 405B', id: 'meta-llama-3.1-405b' },
    { name: 'Llama 3.1 70B', id: 'meta-llama-3.1-70b' },
    { name: 'Mixtral 8x7B', id: 'mistralai/mixtral-8x7b-instruct' }
];

const startBot = async () => {
    bot.start((ctx) => {
        ctx.reply('WELCOME_SUBJECT. I AM YOUR TELEGRAM_AI_INTERFACE. READY_FOR_COMMANDS.\n\nUSE /model TO SWITCH_AI_ENGINE.');
    });

    // Model selection command
    bot.command('model', (ctx) => {
        const currentModel = userModels.get(ctx.chat.id) || 'AUTO_FALLBACK';
        const buttons = AVAILABLE_MODELS.map(m => Markup.button.callback(m.name, `set_model:${m.id}`));

        ctx.reply(`SELECT_AI_LOGIC_CORE\nCURRENT: ${currentModel}`,
            Markup.inlineKeyboard(buttons, { columns: 2 })
        );
    });

    // Handle model selection buttons
    bot.action(/set_model:(.+)/, (ctx) => {
        const modelId = ctx.match[1];
        userModels.set(ctx.chat.id, modelId);
        const modelName = AVAILABLE_MODELS.find(m => m.id === modelId)?.name || modelId;

        ctx.answerCbQuery();
        ctx.editMessageText(`SYSTEM_LOG: AI_CORE_SWITCHED -> ${modelName.toUpperCase()}`);
    });

    bot.on('text', async (ctx) => {
        const userText = ctx.message.text;

        try {
            // Fetch the first assistant to use as personality
            const assistant = await prisma.assistant.findFirst();
            const systemPrompt = assistant?.systemPrompt || 'You are a helpful AI assistant.';

            // Check for user-selected model, otherwise use assistant default, fallback if needed
            const selectedModel = userModels.get(ctx.chat.id);
            const model = selectedModel || assistant?.model || 'gpt-4o-mini';

            // Send typing action to Telegram
            await ctx.sendChatAction('typing');

            // Call Puter.js AI with fallback
            let response;
            try {
                response = await puter.ai.chat([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText }
                ], { model });

                // Check if response indicates success but returned a "model not found" object
                if (response && response.success === false && response.error && response.error.includes('Model not found')) {
                    throw new Error('MODEL_NOT_FOUND_FALLBACK');
                }
            } catch (err) {
                console.warn(`Model ${model} failed, falling back to gpt-4o-mini...`);
                response = await puter.ai.chat([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText }
                ], { model: 'gpt-4o-mini' });
            }

            console.log('Puter AI Response:', response);

            // Robust response extraction
            let aiResponse;
            if (typeof response === 'string') {
                aiResponse = response;
            } else if (response && response.message && response.message.content) {
                aiResponse = response.message.content;
            } else if (response && response.content) {
                aiResponse = response.content;
            } else if (response && response.error) {
                aiResponse = `AI_ERROR: ${response.error.message || response.error}`;
            } else if (response && response.code) {
                // Backend SDK sometimes returns { code: 'token_missing' } instead of throwing
                aiResponse = `SYSTEM_ERROR: ${response.code.toUpperCase()}. PLEASE_CHECK_ENV_CONFIG.`;
            } else {
                console.error('Unexpected Puter response structure:', response);
                aiResponse = 'SYSTEM_MESSAGE: AI_RETURNED_EMPTY_OR_UNEXPECTED_STRUCTURE.';
            }

            // Reply to Telegram
            ctx.reply(aiResponse);
        } catch (error) {
            console.error('Telegram Bot Error:', error);
            if (error.code === 'token_missing' || (error.message && error.message.includes('token_missing'))) {
                ctx.reply('SYSTEM_ERROR: PUTER_TOKEN_MISSING. ACCESS_DENIED. PLEASE_UPDATE_ENV_CONFIG.');
            } else if (error.message && error.message.includes('Prisma')) {
                ctx.reply(`SYSTEM_ERROR: DATABASE_LINK_FAILED. DETAIL: ${error.message.split('\n')[0]}`);
            } else {
                ctx.reply(`SYSTEM_ERROR: AI_LINK_FAILED. DETAIL: ${error.message || 'UNKNOWN_ERROR'}`);
            }
        }
    });

    bot.catch((err, ctx) => {
        console.error(`Telegraf Error for ${ctx.updateType}:`, err);
        ctx.reply('SYSTEM_CRITICAL_ERROR: BOT_CONTROLLER_CRASHED. REBOOT_REQUIRED.');
    });

    try {
        await bot.launch();
        console.log('Telegram Bot is online and listening...');
    } catch (err) {
        console.error('Failed to launch Telegram Bot:', err);
    }

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

module.exports = { startBot };
