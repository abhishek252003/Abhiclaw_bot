const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing bot with token:', process.env.TELEGRAM_BOT_TOKEN);

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

async function test() {
    try {
        console.log('Launching bot...');
        await bot.launch();
        console.log('Bot launched successfully!');
        const botInfo = await bot.telegram.getMe();
        console.log('Bot info:', botInfo);
        await bot.stop();
        console.log('Bot stopped.');
        process.exit(0);
    } catch (err) {
        console.error('BOT TEST FAILED:', err);
        process.exit(1);
    }
}

test();
